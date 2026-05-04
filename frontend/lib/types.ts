export type User = {
  id: number;
  email: string;
  username: string;
  avatar_url: string | null;
};

export type Repository = {
  github_repo_id: string;
  full_name: string;
  html_url: string;
  default_branch: string;
};

export type Chat = {
  id: number;
  title: string;
  repository?: {
    id: number;
    full_name: string;
    html_url: string;
    default_branch: string;
  };
  created_at: string;
};

export type Message = {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  created_at: string;
};

export type Commit = {
  sha: string;
  author_name: string;
  message: string;
  html_url: string;
  committed_at: string;
};

export type AdminStats = {
  users_count: number;
  messages_count: number;
};
