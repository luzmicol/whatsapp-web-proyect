import React, { useContext, useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { WhatsappContext } from "../whatsappContext"

const formatTimeOnly = (fechaStr) => {
  if (!fechaStr) return '';
  if (fechaStr.includes(',')) {
    return fechaStr.split(',')[1].trim();
  }
  return fechaStr;
};

function Contact() {
  const { contact_id } = useParams()
  const { 
    getContactById, 
    messages, 
    createMessage, 
    deleteMessage,
    updateContactById
  } = useContext(WhatsappContext)

  const [messageText, setMessageText] = useState("")
  // Simulation toggle: who is sending the message (true = Yo, false = Contacto)
  const [sendByMe, setSendByMe] = useState(true)

  const chatEndRef = useRef(null)

  const contacto = getContactById(contact_id)

  // Filter messages for this contact
  const chatMessages = messages.filter(
    (msg) => String(msg.contactId) === String(contact_id)
  )

  // Scroll to bottom on new messages or contact change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length, contact_id])

  // Clear unread messages count when opening the chat
  useEffect(() => {
    if (contacto && contacto.mensajes_sin_ver > 0) {
      updateContactById(contacto.id, { mensajes_sin_ver: 0 })
    }
  }, [contact_id, contacto?.mensajes_sin_ver])

  if (!contacto) {
    return (
      <div className="chat-error-container">
        <div className="chat-error-card">
          <h2>Contacto No Encontrado</h2>
          <p>El contacto que estás buscando no existe o fue eliminado.</p>
          <Link to="/" className="btn-primary">Volver al Inicio</Link>
        </div>
      </div>
    )
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    createMessage({
      contactId: contacto.id,
      texto: messageText,
      sentByMe: sendByMe
    })

    setMessageText("")
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <Link to="/" className="back-button-mobile" title="Volver al listado">
          ←
        </Link>
        <div 
          className="chat-avatar" 
          style={{ backgroundColor: contacto.avatarColor || '#3b82f6' }}
        >
          {contacto.nombre.slice(0, 2).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <h2>{contacto.nombre}</h2>
          <span className="connection-status">{contacto.fecha_ult_conexion}</span>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="chat-messages-area">
        {chatMessages.length === 0 ? (
          <div className="chat-empty-state">
            <p>No hay mensajes en este chat.</p>
            <p className="empty-sub">¡Escribe un mensaje a continuación para iniciar la conversación!</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message-row ${msg.sentByMe ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                <span className="message-text">{msg.texto}</span>
                <div className="message-meta">
                  <span className="message-time">{formatTimeOnly(msg.fecha)}</span>
                  <button 
                    className="btn-delete-msg" 
                    onClick={() => deleteMessage(msg.id)}
                    title="Eliminar mensaje"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        {/* Toggle Sender */}
        <div className="sender-toggle" title="Alternar remitente (simulación)">
          <button 
            type="button"
            className={`btn-toggle-sender ${sendByMe ? 'me' : 'them'}`}
            onClick={() => setSendByMe(!sendByMe)}
          >
            {sendByMe ? 'Enviado (Yo) 👤' : 'Recibido (Él/Ella) 👥'}
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Escribe un mensaje..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          required
        />

        <button type="submit" className="btn-send" title="Enviar mensaje">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default Contact