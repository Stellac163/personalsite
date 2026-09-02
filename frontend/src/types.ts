export interface WelcomeConfig {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
}

export interface LinkItem {
  label: string;
  url: string;
  icon?: string; // 链接名前的图标：emoji 或图片 URL
}

export interface ProfileConfig {
  name: string;
  bio: string;
  avatar: string;
  links: LinkItem[];
}

export interface KeywordReply {
  triggers: string[]; // 命中任一触发词即返回 reply（大小写不敏感、包含匹配）
  reply: string; // 自定义回复内容
}

export interface AssistantConfig {
  name: string;
  image: string;
  persona: string;
  keywords?: KeywordReply[]; // 关键词触发回复（命中则直接返回，不调用大模型）
}

export interface SiteSettings {
  background: string; // 全站背景图（必应 API 或图片链接）
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
