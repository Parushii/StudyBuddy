import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FileUpload from "./pages/FileUpload";
import DriveDisplay from "./pages/DriveDisplay";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/files" element={<DriveDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
