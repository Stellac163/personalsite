import { useState } from "react";

// 必应每日一图代理（直接返回图片，可作背景）。想换固定图或其它接口，改这个地址即可。
const BING_URL = "https://api.dujin.org/bing/1920.php";

export default function Background() {
  const [failed, setFailed] = useState(false);

  // 图片加载失败时隐藏整层，露出底下的深色渐变（见 index.css）
  if (failed) return null;

  return (
    <div className="background" aria-hidden="true">
      <img src={BING_URL} alt="" onError={() => setFailed(true)} />
      <div className="background__overlay" />
    </div>
  );
}
