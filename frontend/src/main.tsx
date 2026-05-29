import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import './styles/theme.css'
import App from './App.tsx'
import { useUiStore } from './stores/uiStore'

// 앱 로드 시 theme 즉시 적용
const { theme } = useUiStore.getState();
document.documentElement.setAttribute('data-theme', theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
