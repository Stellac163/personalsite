import { Routes, Route } from "react-router-dom";
import Background from "./components/Background";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";

export default function App() {
  return (
    <>
      <Background />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
    </>
  );
}
