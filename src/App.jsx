import { Route, Routes, useLocation } from 'react-router-dom'
import WhatsappSidebar from "./sidebar/whatsappsidebar"
import Contact from "./sidebar/contact"

function App() {
  const location = useLocation();
  const isChatActive = location.pathname.startsWith('/contact/');

  return (
    <div className="whatsapp-app">
      <div className={`whatsapp-main-container ${isChatActive ? 'chat-active' : 'sidebar-active'}`}>
        <WhatsappSidebar />
        <div className="whatsapp-chat-container">
          <Routes>
            <Route path="/" element={
              <div className="whatsapp-empty-chat">
                <div className="empty-chat-content">
                  <div className="empty-chat-logo">
                    <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.76 4.19 2.04 5.79L3 21l3.29-.96C7.81 20.76 9.83 21.2 12 21.2c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z"/>
                    </svg>
                  </div>
                  <h2>WhatsApp Web</h2>
                  <p>Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
                  <p className="empty-chat-subtext">Selecciona un contacto de la lista para comenzar a chatear.</p>
                </div>
              </div>
            } />
            <Route path="/contact/:contact_id" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App