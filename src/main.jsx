import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TodoProvider } from './context/TodoContext'
import { ProfileProvider } from './context/ProfileContext'
import { TemplatesProvider } from './context/TemplatesContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileProvider>
      <TodoProvider>
        <TemplatesProvider>
          <App />
        </TemplatesProvider>
      </TodoProvider>
    </ProfileProvider>
  </StrictMode>,
)
