import { Dashboard } from './components/home/DashBoard'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FavoritoView } from './components/home/FavoritoView';
import { FavoritesSimulator } from './components/simulator/FavoritesSimulator';
import { Configuration } from './components/configuration/Configuration';
export const App = () => {
  return (
    // Usamos HashRouter porque es el estándar para aplicaciones Electron/Desktop
    <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/favorites" element={<FavoritoView />} />
          <Route path="/simulator" element={<FavoritesSimulator />} />
          <Route path="/configuracion" element={<Configuration />} />
        </Routes>
    </HashRouter>
  );
};