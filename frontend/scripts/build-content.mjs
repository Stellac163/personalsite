// 把 content/ 下的配置与文章，编译成前端可直接 import 的 JSON 数据。
// 由 `npm run build` 在构建前自动调用。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../.."); // personal-site/
const contentDir = path.join(root, "content");
const postsDir = path.join(contentDir, "posts");
const outFile = path.join(__dirname, "../src/data/content.json");

const config = JSON.parse(
  fs.readFileSync(path.join(contentDir, "config.json"), "utf8")
);

const posts = [];
if (fs.existsSync(postsDir)) {
  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);
    posts.push({
      id: file.replace(/\.md$/, ""),
      type: data.type || "article",
      title: data.title || "未命名",
      summary: data.summary || "",
      content: content.trim(),
      cover: data.cover || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: data.published !== false,
      date: data.date || "",
    });
  }
}

posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

const published = posts.filter((p) => p.published);
const out = { config, posts: published };

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
console.log(`[content] 生成 ${published.length} 篇内容 → src/data/content.json`);
