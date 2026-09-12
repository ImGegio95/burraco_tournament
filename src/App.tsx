// ============================================================================
// App — Router principale
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router';
import { TournamentProvider } from './context/TournamentContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SetupPage from './pages/SetupPage';
import TournamentPage from './pages/TournamentPage';
import StandingsPage from './pages/StandingsPage';

export default function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/tournament" element={<TournamentPage />} />
            <Route path="/standings" element={<StandingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}
