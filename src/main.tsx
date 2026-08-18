import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { GameProvider } from './store/GameContext';
import { QuestionBankProvider } from './store/QuestionBankContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QuestionBankProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </QuestionBankProvider>
    </BrowserRouter>
  </StrictMode>
);
