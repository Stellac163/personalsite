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
