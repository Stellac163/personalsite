import { Link } from "react-router-dom";
import type { Post } from "../types";
import { TYPE_LABELS } from "../types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link className="card" to={`/post/${post.id}`}>
      <span className="card__type">{TYPE_LABELS[post.type] || post.type}</span>
      <h3 className="card__title">{post.title}</h3>
      {post.summary && <p className="card__summary">{post.summary}</p>}
      {post.tags.length > 0 && (
        <div className="card__tags">
          {post.tags.map((t) => (
            <span key={t} className="card__tag">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
