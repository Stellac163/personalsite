import { useEffect, useState } from "react";

// 主页右下角的小组件：实时时钟 + 一言格言（位于 AI 助手上方）
export default function SideWidget() {
  return (
    <div className="side-widget">
      <Clock />
      <Hitokoto />
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const text = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return <div className="side-widget__clock">{text}</div>;
}

function Hitokoto() {
  const [text, setText] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("https://v1.hitokoto.cn")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setText(d.hitokoto + (d.from ? ` —— ${d.from}` : ""));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!text) return null;
  return <div className="side-widget__hitokoto">{text}</div>;
}
