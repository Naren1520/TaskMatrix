import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TodoProvider } from './context/TodoContext'
import { ProfileProvider } from './context/ProfileContext'
import { TemplatesProvider } from './context/TemplatesContext'
import { StudyModeProvider } from './context/StudyModeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileProvider>
      <TodoProvider>
        <TemplatesProvider>
          <StudyModeProvider>
            <App />
          </StudyModeProvider>
        </TemplatesProvider>
      </TodoProvider>
    </ProfileProvider>
  </StrictMode>,
)
