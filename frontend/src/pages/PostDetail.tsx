import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getPostById } from "../data";
import { TYPE_LABELS } from "../types";

export default function PostDetail() {
  const { id } = useParams();
  const post = id ? getPostById(id) : undefined;

  if (!post) {
    return (
      <div className="post">
        <Link className="post__back" to="/home">
          ← 返回首页
        </Link>
        <p>内容不存在。</p>
      </div>
    );
  }

  return (
    <div className="post">
      <Link className="post__back" to="/home">
        ← 返回首页
      </Link>
      <h1>{post.title}</h1>
      <div className="post__meta">
        <span>{TYPE_LABELS[post.type] || post.type}</span>
        {post.date && <span>{post.date}</span>}
        {post.tags.map((t) => (
          <span key={t}>#{t}</span>
        ))}
      </div>
      <div className="markdown">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}
