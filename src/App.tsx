import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DiagramProvider } from './context/DiagramContext';
import { ThemeProvider } from './context/ThemeContext';
import DiagramPage from './pages/DiagramPage';

function App() {
  return (
    <ThemeProvider>
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
