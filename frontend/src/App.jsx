import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FileUpload from "./pages/FileUpload";
import DriveDisplay from "./pages/DriveDisplay";
import "./App.css";
import VoiceToText from "./pages/VoiceToText";
import { NotesProvider } from "./context/NotesProvider";
import Editor from "./pages/Editor";
import YoutubeLink from "./pages/YoutubeLink";
import NotebookView from "./pages/NotebookView";
import SchedulePlanner from "./pages/SchedulePlanner";
import ThemeToggle from "./pages/ThemeToggle";
import { ThemeProvider } from "./context/ThemeProvider"; 
import Whiteboard from "./pages/WhiteBoard";
import HighlightedTopicsView from "./pages/HighlightedTopicsView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/files" element={<DriveDisplay />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/voicetotext" element={<VoiceToText />} />
            <Route path="/youtubelink" element={<YoutubeLink />} />
            <Route path="/notebookview" element={<NotebookView />} />
            <Route path="/scheduleplanner" element={<SchedulePlanner />} />    
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/highlightedtopics" element={<HighlightedTopicsView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </NotesProvider>
    </ThemeProvider>

  );
}

export default App;
