import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FileUpload from "./pages/FileUpload";
import DriveDisplay from "./pages/DriveDisplay";
import "./App.css";
import VoiceToText from "./pages/VoiceToText";
import { NotesProvider } from "./pages/NotesProvider";
import Editor from "./pages/Editor";
import YoutubeLink from "./pages/YoutubeLink";


function App() {
  return (
    <NotesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/files" element={<DriveDisplay />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/voicetotext" element={<VoiceToText />} />
          <Route path="/youtubelink" element={<YoutubeLink />} />
        </Routes>
      </Router>
    </NotesProvider>

  );
}

export default App;
