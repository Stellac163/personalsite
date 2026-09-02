import raw from "./data/content.json";
import type { Post, SiteSettings } from "./types";

const data = raw as { config: SiteSettings; posts: Post[] };

export const settings: SiteSettings = data.config;
export const posts: Post[] = data.posts;

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

// 站点标签（始终在最前补一个「全部」）
export function allTags(): string[] {
  return ["全部", ...settings.tags.filter((t) => t !== "全部")];
}
