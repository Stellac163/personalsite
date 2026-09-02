import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { posts, settings } from "../data";
import type { ChatMessage, Post } from "../types";

// Cloudflare Worker 地址：在 frontend/.env 里设置 VITE_ASSISTANT_URL。
// 未设置时，助手降级为「站内问答」（纯本地，不接大模型）。
const WORKER_URL = import.meta.env.VITE_ASSISTANT_URL as string | undefined;

export default function Assistant() {
  const assistant = settings.assistant || { name: "AI 助手", image: "", persona: "" };
  const name = assistant.name || "AI 助手";
  const image = assistant.image || "";
  const persona = assistant.persona || "";

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [bubble, setBubble] = useState(
    `你好，我是${name}，可以问我关于作者或本站的任何问题～`
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "summary", "content", "tags"],
        threshold: 0.4,
      }),
    []
  );

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const h: ChatMessage[] = [...history, { role: "user", content: text }];
    setHistory(h);
    setInput("");
    setLoading(true);
    try {
      const reply = await ask(text, history, fuse, persona);
      setBubble(reply);
      setHistory([...h, { role: "assistant", content: reply }]);
    } catch {
      setBubble("出错了，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant">
      <div className="assistant__character">
        <div className="assistant__bubble">
          {loading ? "正在思考…" : bubble}
        </div>
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span className="assistant__emoji">🤖</span>
        )}
      </div>
      <div className="assistant__input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`问 ${name} 问题…`}
        />
        <button className="assistant__send" onClick={send} disabled={loading}>
          发送
        </button>
      </div>
    </div>
  );
}

async function ask(
  message: string,
  history: ChatMessage[],
  fuse: Fuse<Post>,
  persona: string
): Promise<string> {
  // 本地检索相关内容，作为上下文
  const related = fuse
    .search(message)
    .map((r) => r.item)
    .slice(0, 5);
  const context = related
    .map(
      (p) =>
        `【${p.title}】（${p.type}）\n${p.summary}\n${p.content.slice(0, 300)}`
    )
    .join("\n\n---\n\n");

  // 未配置 Worker：降级为纯站内问答
  if (!WORKER_URL) {
    if (related.length === 0) {
      return "我在站内没有找到相关内容。换个关键词试试，或用右上角搜索框。";
    }
    const list = related
      .map(
        (p, i) => `${i + 1}. ${p.title}${p.summary ? " —— " + p.summary : ""}`
      )
      .join("\n");
    return `我在站内找到这些相关内容，或许对你有帮助：\n\n${list}`;
  }

  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context, persona }),
  });
  if (!resp.ok) throw new Error("worker error");
  const data = (await resp.json()) as { reply: string };
  return data.reply;
}
