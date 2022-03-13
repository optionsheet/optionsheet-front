export interface CreateUserModel {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface User {
  username: string;
  url: string;
  html_url: string;
  projects_url: string;
  email: string;
  avatar_url: string;
  bio: string;
  created_on: Date;
  updated_on: Date;
  is_admin: boolean;
}