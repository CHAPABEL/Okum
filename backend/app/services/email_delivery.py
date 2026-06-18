import logging
import smtplib
import socket
import ssl
import time
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)

_MAX_ATTEMPTS = 3
_RETRY_DELAY_SEC = 1.5
_SMTP_TIMEOUT_SEC = 30


def _ipv4_socket(host: str, port: int, timeout: float) -> socket.socket:
    """Docker bridge часто без IPv6 — smtplib по умолчанию падает с Errno 101."""
    last_error: OSError | None = None
    for _, _, _, _, sockaddr in socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        try:
            sock.connect(sockaddr)
            return sock
        except OSError as exc:
            last_error = exc
            sock.close()
    raise OSError(f"IPv4 connect to {host}:{port} failed") from last_error


class _SMTPIPv4(smtplib.SMTP):
    def _get_socket(self, host, port, timeout):
        return _ipv4_socket(host, port, timeout if timeout is not None else _SMTP_TIMEOUT_SEC)


class _SMTPSSLIPv4(smtplib.SMTP_SSL):
    def _get_socket(self, host, port, timeout):
        return _ipv4_socket(host, port, timeout if timeout is not None else _SMTP_TIMEOUT_SEC)


def send_verification_email(to_addr: str, code: str) -> None:
    body = (
        "Код подтверждения почты: "
        f"{code}\n\n"
        "Код действителен 15 минут. Если вы его не запрашивали, проигнорируйте это письмо."
    )
    subject = "Подтверждение почты"
    to_addr = to_addr.strip()

    if not settings.smtp_host.strip():
        logger.warning("SMTP не настроен — код для %s: %s", to_addr, code)
        return

    from_addr = settings.smtp_from.strip() or settings.smtp_user.strip()
    if not from_addr:
        raise RuntimeError("Задайте SMTP_FROM или SMTP_USER")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg.set_content(body)

    host = settings.smtp_host.strip()
    port = int(settings.smtp_port)
    user = settings.smtp_user.strip()
    password = settings.smtp_password

    last_error: Exception | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            _deliver(host, port, user, password, msg)
            logger.info("Письмо с кодом отправлено на %s (попытка %s)", to_addr, attempt)
            return
        except (OSError, smtplib.SMTPException) as exc:
            last_error = exc
            logger.warning(
                "SMTP ошибка для %s (попытка %s/%s): %s",
                to_addr,
                attempt,
                _MAX_ATTEMPTS,
                exc,
            )
            if attempt < _MAX_ATTEMPTS:
                time.sleep(_RETRY_DELAY_SEC)

    logger.error("Не удалось отправить письмо на %s после %s попыток", to_addr, _MAX_ATTEMPTS)
    raise RuntimeError("Не удалось отправить письмо") from last_error


def _deliver(host: str, port: int, user: str, password: str, msg: EmailMessage) -> None:
    if port == 465:
        context = ssl.create_default_context()
        with _SMTPSSLIPv4(host, port, context=context, timeout=_SMTP_TIMEOUT_SEC) as smtp:
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
        return

    with _SMTPIPv4(host, port, timeout=_SMTP_TIMEOUT_SEC) as smtp:
        if settings.smtp_use_tls:
            context = ssl.create_default_context()
            smtp.starttls(context=context)
        if user:
            smtp.login(user, password)
        smtp.send_message(msg)
