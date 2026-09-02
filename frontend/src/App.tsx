import { Routes, Route, useLocation } from "react-router-dom";
import Background from "./components/Background";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";

export default function App() {
  const location = useLocation();
  // 主页垫在欢迎页下面；在「/」时欢迎页覆盖其上，进入时上滑露出主页。
  const showWelcome = location.pathname === "/";

  return (
    <>
      <Background />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
      {showWelcome && <Welcome />}
    </>
  );
}
