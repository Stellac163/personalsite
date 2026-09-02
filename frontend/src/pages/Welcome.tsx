import { useNavigate } from "react-router-dom";
import { settings } from "../data";

export default function Welcome() {
  const navigate = useNavigate();
  const welcome = settings.welcome;

  return (
    <div className="welcome">
      <div className="welcome__inner">
        <h1>{welcome.title}</h1>
        <p className="subtitle">{welcome.subtitle}</p>
        <p className="description">{welcome.description}</p>
        <button className="welcome__enter" onClick={() => navigate("/home")}>
          {welcome.button_text}
        </button>
      </div>
    </div>
  );
}
