export interface WelcomeConfig {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
}

export interface LinkItem {
  label: string;
  url: string;
}

export interface ProfileConfig {
  name: string;
  bio: string;
  avatar: string;
  links: LinkItem[];
}

export interface AssistantConfig {
  name: string;
  image: string;
  persona: string;
}

export interface SiteSettings {
  welcome: WelcomeConfig;
  profile: ProfileConfig;
  tags: string[];
  assistant: AssistantConfig;
}

export interface Post {
  id: string; // 文件名（slug）
  type: string;
  title: string;
  summary: string;
  content: string;
  cover: string;
  tags: string[];
  published: boolean;
  date: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const TYPE_LABELS: Record<string, string> = {
  article: "文章",
  project: "作品",
  analysis: "分析",
};
