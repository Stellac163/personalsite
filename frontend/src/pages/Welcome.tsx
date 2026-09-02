import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { settings } from "../data";

export default function Welcome() {
  const navigate = useNavigate();
  const welcome = settings.welcome;

  return (
    <div className="welcome">
      <div className="welcome__card">
        <h1>{welcome.title}</h1>
        <p className="subtitle">{welcome.subtitle}</p>
        <Typewriter text={welcome.description} />
        <div className="welcome__extras">
          <Clock />
          <Hitokoto />
        </div>
        <button className="welcome__enter" onClick={() => navigate("/home")}>
          {welcome.button_text}
        </button>
      </div>
    </div>
  );
}

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 90);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <p className="description">
      {shown}
      <span className="typewriter__cursor">|</span>
    </p>
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
  return <div className="welcome__clock">{text}</div>;
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
  return <div className="welcome__hitokoto">{text}</div>;
}
