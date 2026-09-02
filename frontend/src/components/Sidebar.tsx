import { Link } from "react-router-dom";
import type { ProfileConfig } from "../types";

export default function Sidebar({ profile }: { profile: ProfileConfig }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__avatar">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} />
        ) : (
          profile.name.slice(0, 1)
        )}
      </div>
      <h2 className="sidebar__name">{profile.name}</h2>
      <p className="sidebar__bio">{profile.bio}</p>
      <div className="sidebar__links">
        {profile.links.map((l) => (
          <a
            key={l.url}
            className="sidebar__link"
            href={l.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="sidebar__link-icon">
              {l.icon ? (
                l.icon.startsWith("http") ? (
                  <img src={l.icon} alt="" />
                ) : (
                  l.icon
                )
              ) : (
                "↗"
              )}
            </span>
            {l.label}
          </a>
        ))}
      </div>
      <Link className="sidebar__back" to="/">
        ← 返回欢迎页
      </Link>
    </aside>
  );
}
