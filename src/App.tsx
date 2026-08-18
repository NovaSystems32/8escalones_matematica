import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GameSetup } from './components/GameSetup';
import { ControlPanel } from './components/ControlPanel';
import { PresentationScreen } from './components/PresentationScreen';
import { ResumeGameDialog } from './components/ResumeGameDialog';
import { useGame, hayPartidaGuardada } from './store/GameContext';

function Fondo() {
  return (
    <div className="fondo-escenario" aria-hidden="true">
      <div className="destellos" />
    </div>
  );
}

function Inicio() {
  const [mostrarDialogo, setMostrarDialogo] = useState(false);

  useEffect(() => {
    setMostrarDialogo(hayPartidaGuardada());
  }, []);

  return (
    <>
      <GameSetup />
      {mostrarDialogo && <ResumeGameDialog onCerrar={() => setMostrarDialogo(false)} />}
    </>
  );
}

function ModoCombinado() {
  return (
    <div className="flex flex-col">
      <div className="border-b-4 border-[var(--dorado)]/40">
        <PresentationScreen />
      </div>
      <div className="border-t-4 border-[var(--dorado)]/40">
        <ControlPanel incrustado />
      </div>
    </div>
  );
}

function ClaseReducirAnimaciones() {
  const { state } = useGame();
  useEffect(() => {
    document.documentElement.classList.toggle('reducir-animaciones', state.configuracion.animacionesReducidas);
  }, [state.configuracion.animacionesReducidas]);
  return null;
}

function App() {
  return (
    <>
      <Fondo />
      <ClaseReducirAnimaciones />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/control" element={<ControlPanel />} />
        <Route path="/presentacion" element={<PresentationScreen />} />
        <Route path="/combinado" element={<ModoCombinado />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </>
  );
}

export default App;
