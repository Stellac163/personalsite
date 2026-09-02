import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { posts } from "../data";
import type { Post } from "../types";
import { TYPE_LABELS } from "../types";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "summary", "content", "tags"],
        threshold: 0.4,
      }),
    []
  );

  const results: Post[] = q.trim()
    ? fuse
        .search(q.trim())
        .map((r) => r.item)
        .slice(0, 12)
    : [];

  return (
    <div className="search">
      <span className="search__icon">🔍</span>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (e.target.value.trim()) setOpen(true);
        }}
        placeholder="搜索站内内容…"
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && q.trim() && (
        <div className="search__panel">
          {results.length === 0 ? (
            <div className="search__empty">没有找到相关内容</div>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                className="search__item"
                to={`/post/${r.id}`}
                onClick={() => setOpen(false)}
              >
                <div className="search__item-title">{r.title}</div>
                <div className="search__item-summary">
                  {TYPE_LABELS[r.type] || r.type} · {r.summary}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
