import { useState } from "react";
import { allTags, posts, settings } from "../data";
import Sidebar from "../components/Sidebar";
import TagNav from "../components/TagNav";
import SearchBar from "../components/SearchBar";
import Assistant from "../components/Assistant";
import SideWidget from "../components/SideWidget";
import PostCard from "../components/PostCard";

export default function Home() {
  const [activeTag, setActiveTag] = useState("全部");
  const tags = allTags();
  const filtered =
    activeTag === "全部"
      ? posts
      : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="home">
      <Sidebar profile={settings.profile} />
      <div className="main">
        <div className="main__top">
          <TagNav tags={tags} active={activeTag} onChange={setActiveTag} />
          <SearchBar />
        </div>
        <div className="content">
          {filtered.length === 0 ? (
            <div className="content__empty">这个标签下还没有内容。</div>
          ) : (
            filtered.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>
      <div className="corner">
        <SideWidget />
        <Assistant />
      </div>
    </div>
  );
}
