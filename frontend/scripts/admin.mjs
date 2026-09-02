// 本地图形管理工具：在 frontend 目录运行 `npm run admin`，
// 浏览器打开 http://localhost:3456 即可编辑欢迎页/简介/标签/内容，
// 保存后内容写入 content/ 目录，git push 即上线。
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { exec } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../.."); // personal-site/
const CONTENT_DIR = path.join(ROOT, "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const CONFIG_FILE = path.join(CONTENT_DIR, "config.json");
const ADMIN_HTML = path.join(__dirname, "admin.html");

const PORT = process.env.PORT || 3456;

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
}

function readPosts() {
  const posts = [];
  if (!fs.existsSync(POSTS_DIR)) return posts;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    posts.push({
      id: file.replace(/\.md$/, ""),
      type: data.type || "article",
      title: data.title || "",
      summary: data.summary || "",
      content: content.trim(),
      cover: data.cover || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: data.published !== false,
      date: data.date || "",
    });
  }
  posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return posts;
}

function slugify(title) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\w一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

function writePost(post) {
  const id = post.id || slugify(post.title);
  const content = post.content || "";
  const data = {
    type: post.type || "article",
    title: post.title || "",
    summary: post.summary || "",
    cover: post.cover || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    published: post.published !== false,
    date: post.date || new Date().toISOString().slice(0, 10),
  };
  const md = matter.stringify(content, data).trimEnd() + "\n";
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(POSTS_DIR, `${id}.md`), md, "utf8");
  return id;
}

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendHtml(res, file) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(file, "utf8"));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function runGit(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: ROOT, timeout: 120000, windowsHide: true }, (err, stdout, stderr) => {
      const out = ((stdout || "") + (stderr || "")).trim();
      if (err) reject(new Error(out || String(err)));
      else resolve(out);
    });
  });
}

async function publishSite() {
  const changed = await runGit("git status --porcelain");
  if (!changed) return { published: false, message: "没有新改动" };
  const ts = new Date().toLocaleString("zh-CN", { hour12: false });
  await runGit("git add -A");
  await runGit(`git commit -m "更新内容 ${ts}"`);
  const out = await runGit("git push");
  return { published: true, message: out || "已发布" };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  try {
    if (req.method === "GET" && p === "/") {
      return sendHtml(res, ADMIN_HTML);
    }
    if (req.method === "GET" && p === "/api/state") {
      return json(res, { config: readConfig(), posts: readPosts() });
    }
    if (req.method === "POST" && p === "/api/config") {
      const config = await readBody(req);
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
      return json(res, { ok: true });
    }
    if (req.method === "POST" && p === "/api/posts") {
      const post = await readBody(req);
      const id = writePost(post);
      return json(res, { ok: true, id });
    }
    if (req.method === "DELETE" && p.startsWith("/api/posts/")) {
      const id = decodeURIComponent(p.replace("/api/posts/", ""));
      fs.unlinkSync(path.join(POSTS_DIR, `${id}.md`));
      return json(res, { ok: true });
    }
    if (req.method === "POST" && p === "/api/publish") {
      try {
        const result = await publishSite();
        return json(res, { ok: true, ...result });
      } catch (err) {
        return json(res, { ok: false, error: String((err && err.message) || err) });
      }
    }
    json(res, { error: "not found" }, 404);
  } catch (err) {
    json(res, { error: String(err) }, 500);
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log(`  本地管理工具已启动： http://localhost:${PORT}`);
  console.log("  编辑保存后，点击右上角「发布到线上」即可自动提交并推送。");
  console.log("");
});
