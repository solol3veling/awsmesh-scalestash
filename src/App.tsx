import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DiagramProvider } from './context/DiagramContext';
import DiagramPage from './pages/DiagramPage';

function App() {
  return (
    <DiagramProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/diagram" replace />} />
          <Route path="/diagram" element={<DiagramPage />} />
        </Routes>
      </Router>
    </DiagramProvider>
  );
}

export default App;
