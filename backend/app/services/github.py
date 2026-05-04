import httpx

from app.core.config import settings


async def exchange_code_for_token(code: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_redirect_uri,
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()["access_token"]


async def fetch_user(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient() as client:
        user_resp = await client.get("https://api.github.com/user", headers=headers, timeout=20)
        user_resp.raise_for_status()
        user = user_resp.json()

        email_resp = await client.get("https://api.github.com/user/emails", headers=headers, timeout=20)
        email_resp.raise_for_status()
        emails = email_resp.json()

    primary_email = next((item["email"] for item in emails if item.get("primary")), None) or user.get("email")
    return {
        "provider_user_id": str(user["id"]),
        "username": user.get("login") or f"user-{user['id']}",
        "email": primary_email or f"github-{user['id']}@local.invalid",
        "avatar_url": user.get("avatar_url"),
    }


async def fetch_repositories(access_token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.github.com/user/repos?per_page=100", headers=headers, timeout=20)
        response.raise_for_status()
        repos = response.json()
    return [
        {
            "github_repo_id": str(repo["id"]),
            "full_name": repo["full_name"],
            "html_url": repo["html_url"],
            "default_branch": repo.get("default_branch") or "main",
        }
        for repo in repos
    ]


async def fetch_repository_commits(access_token: str, full_name: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    url = f"https://api.github.com/repos/{full_name}/commits?per_page=50"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=20)
        if response.status_code >= 400:
            return []
        commits = response.json()
    output = []
    for item in commits:
        commit = item.get("commit", {})
        author = commit.get("author", {})
        output.append(
            {
                "sha": item.get("sha", ""),
                "author_name": author.get("name", "unknown"),
                "message": commit.get("message", ""),
                "html_url": item.get("html_url", "#"),
                "committed_at": author.get("date"),
            }
        )
    return output
