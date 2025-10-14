import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DiagramProvider } from './context/DiagramContext';
import { ThemeProvider } from './context/ThemeContext';
import DiagramPage from './pages/DiagramPage';

function App() {
  return (
    <ThemeProvider>
      <title>AWSMesh - Visualize Your AWS Infrastructure</title>
      <meta name="description" content="An intuitive drag-and-drop tool to design, visualize, and manage your AWS cloud architecture with AWSMesh." />
      <DiagramProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/diagram" replace />} />
            <Route path="/diagram" element={<DiagramPage />} />
          </Routes>
        </Router>
      </DiagramProvider>
    </ThemeProvider>
  );
}

export default App;
