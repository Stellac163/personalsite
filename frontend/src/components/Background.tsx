import { useState } from "react";
import { settings } from "../data";

// 背景图链接在 content/config.json 的 background 字段配置（管理工具里可改）。
export default function Background() {
  const url = settings.background || "";
  const [failed, setFailed] = useState(false);

  // 图片加载失败时隐藏整层，露出底下的深色渐变（见 index.css）
  if (!url || failed) return null;

  return (
    <div className="background" aria-hidden="true">
      <img src={url} alt="" onError={() => setFailed(true)} />
      <div className="background__overlay" />
    </div>
  );
}
