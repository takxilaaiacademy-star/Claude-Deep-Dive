import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Player from './pages/Player';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/learn/:screenId" element={<Player />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
