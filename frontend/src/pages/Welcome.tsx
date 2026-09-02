import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { settings } from "../data";

export default function Welcome({ hidden }: { hidden: boolean }) {
  const navigate = useNavigate();
  const welcome = settings.welcome;

  // 欢迎页显示期间锁定滚动，避免底下主页的滚动条露出来。
  useEffect(() => {
    if (hidden) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [hidden]);

  return (
    <div className={`welcome${hidden ? " welcome--hidden" : ""}`}>
      <WelcomeBackdrop url={settings.background} />
      <div className="welcome__card">
        <h1>{welcome.title}</h1>
        <p className="subtitle">{welcome.subtitle}</p>
        <Typewriter text={welcome.description} active={!hidden} />
        <button className="welcome__enter" onClick={() => navigate("/home")}>
          {welcome.button_text}
        </button>
      </div>
    </div>
  );
}

// 欢迎页自身的整屏背景（复用全站背景图），用于盖住下方的主页。
function WelcomeBackdrop({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return null;
  return (
    <div className="welcome__bg" aria-hidden="true">
      <img src={url} alt="" onError={() => setFailed(true)} />
      <div className="welcome__bg-overlay" />
    </div>
  );
}

function Typewriter({ text, active }: { text: string; active: boolean }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!active) return;
    setShown("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 90);
    return () => clearInterval(timer);
  }, [text, active]);

  return (
    <p className="description">
      {shown}
      <span className="typewriter__cursor">|</span>
    </p>
  );
}
