import { Routes, Route, useLocation } from "react-router-dom";
import Background from "./components/Background";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";

export default function App() {
  const location = useLocation();
  // 欢迎页作为覆盖层始终挂载：位于「/」时显示，进入主页后滑到屏幕外，返回时再滑回。
  const welcomeHidden = location.pathname !== "/";

  return (
    <>
      <Background />
      <Routes>
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Welcome hidden={welcomeHidden} />
    </>
  );
}
