import React, { useContext, useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { WhatsappContext } from "../whatsappContext"

const formatWhatsAppTime = (fechaStr) => {
  if (!fechaStr) return '';
  if (fechaStr.includes('a. m.') || fechaStr.includes('p. m.')) return fechaStr;
  const parts = fechaStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (isNaN(hours)) return fechaStr;
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return fechaStr;
};

const WALLPAPERS = [
  { id: '1', name: '1', title: 'Opción 1', src: '/wallpapers/wallpaper1.png' },
  { id: '2', name: '2', title: 'Opción 2', src: '/wallpapers/wallpaper2.jpg' },
  { id: '3', name: '3', title: 'Opción 3', src: '/wallpapers/wallpaper3.jpg' },
  { id: '4', name: '4', title: 'Opción 4', isDefault: true }
];

function Contact() {
  const { contact_id } = useParams()
  const navigate = useNavigate()
  const { 
    getContactById, 
    messages, 
    createMessage, 
    deleteMessage,
    deleteContact,
    updateContactById
  } = useContext(WhatsappContext)

  const [messageText, setMessageText] = useState("")
  const [sendByMe, setSendByMe] = useState(true)
  const [activeMsgId, setActiveMsgId] = useState(null)

  // Modals state
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showWallpaperModal, setShowWallpaperModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editConn, setEditConn] = useState("")

  const chatEndRef = useRef(null)

  const contacto = getContactById(contact_id)

  // Filter messages for this contact
  const chatMessages = messages.filter(
    (msg) => String(msg.contactId) === String(contact_id)
  )

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return 'Hoy';
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) return 'Hoy';
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Ayer';
    
    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7 && diffDays > 0) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[msgDate.getDay()];
    }
    
    return msgDate.toLocaleDateString();
  };

  const groupedMessages = [];
  let lastDateString = null;
  
  chatMessages.forEach(msg => {
    const msgDate = msg.timestamp ? new Date(msg.timestamp).toDateString() : new Date().toDateString();
    if (msgDate !== lastDateString) {
      groupedMessages.push({
        type: 'date-separator',
        id: `date-${msgDate}`,
        label: formatMessageDate(msg.timestamp)
      });
      lastDateString = msgDate;
    }
    groupedMessages.push({
      type: 'message',
      ...msg
    });
  });

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

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${contacto.nombre}?`)) {
      deleteContact(contacto.id)
      setShowInfoModal(false)
      navigate('/')
    }
  }

  const startEdit = () => {
    setEditName(contacto.nombre || '')
    setEditPhone(contacto.telefono || '+54 9 11 1234-5678')
    setEditConn(contacto.fecha_ult_conexion || 'En línea')
    setShowEditModal(true)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    updateContactById(contacto.id, {
      nombre: editName,
      telefono: editPhone,
      fecha_ult_conexion: editConn
    })
    setShowEditModal(false)
  }

  const currentWallpaper = contacto.wallpaper || '4'
  const isCustomWallpaper = currentWallpaper === '1' || currentWallpaper === '2' || currentWallpaper === '3'

  const getWallpaperStyle = () => {
    if (currentWallpaper === '1') {
      return { backgroundImage: `url('/wallpapers/wallpaper1.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    }
    if (currentWallpaper === '2') {
      return { backgroundImage: `url('/wallpapers/wallpaper2.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    }
    if (currentWallpaper === '3') {
      return { backgroundImage: `url('/wallpapers/wallpaper3.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    }
    return {}
  }

  return (
    <div className={`chat-window ${isCustomWallpaper ? 'has-custom-wallpaper' : ''}`} style={getWallpaperStyle()}>
      {/* Chat Header */}
      <div className="chat-header">
        <Link to="/" className="back-button-mobile" title="Volver al listado">
          ←
        </Link>

        <div 
          className="chat-header-user-clickable" 
          onClick={() => setShowInfoModal(true)}
          title="Toca para ver la info del contacto"
        >
          <div 
            className="chat-avatar" 
            style={{ backgroundColor: contacto.avatarColor || '#3b82f6' }}
          >
            {contacto.isGroup ? <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span> : contacto.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="chat-header-info">
            <h2>{contacto.nombre}</h2>
            <span className="connection-status">{contacto.fecha_ult_conexion}</span>
          </div>
        </div>

        <div className="chat-header-actions" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button className="icon-btn-action" title="Videollamada" type="button">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button className="icon-btn-action" title="Llamada" type="button">
            <span className="material-symbols-outlined">call</span>
          </button>
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
          groupedMessages.map((item) => {
            if (item.type === 'date-separator') {
              return (
                <div key={item.id} className="date-separator-container">
                  <span className="date-separator-bubble">{item.label}</span>
                </div>
              );
            }
            
            const msg = item;
            const isSelected = activeMsgId === msg.id;
            return (
              <div 
                key={msg.id} 
                className={`message-row ${msg.sentByMe ? 'sent' : 'received'} ${isSelected ? 'has-dropdown' : ''}`}
              >
                <div 
                  className={`message-bubble ${isSelected ? 'selected' : ''}`}
                >
                  <span className="message-text">{msg.texto}</span>
                  <span className="message-meta">
                    <span className="message-time">{formatWhatsAppTime(msg.fecha)}</span>
                    {msg.sentByMe && <span className="material-symbols-outlined msg-checkmark" style={{ fontSize: '16px' }}>done_all</span>}
                  </span>

                  <button 
                    className={`msg-options-btn ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMsgId(isSelected ? null : msg.id);
                    }}
                    title="Opciones"
                  >
                    <span className="material-symbols-outlined">keyboard_arrow_down</span>
                  </button>

                  {isSelected && (
                    <div className="msg-dropdown">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(msg.id);
                          setActiveMsgId(null);
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '10px' }}>delete</span>
                        Eliminar mensaje
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
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
            {sendByMe ? 'Enviado (Yo)' : 'Recibido (Contacto)'}
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
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>send</span>
        </button>
      </form>

      {/* Contact Info Modal / Drawer (Centered inside Chat space) */}
      {showInfoModal && (
        <div className="chat-modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <h2>Info del contacto</h2>
              <button 
                className="btn-close-modal" 
                onClick={() => setShowInfoModal(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            <div className="info-modal-body">
              <div 
                className="info-avatar" 
                style={{ backgroundColor: contacto.avatarColor || '#3b82f6' }}
              >
                {contacto.isGroup ? <span className="material-symbols-outlined" style={{ fontSize: '100px' }}>group</span> : contacto.nombre.slice(0, 2).toUpperCase()}
              </div>

              <h3 className="info-name">{contacto.nombre}</h3>
              <p className="info-phone">Teléfono: {contacto.telefono || '+54 9 11 1234-5678'}</p>
              <p className="info-status">Estado: {contacto.fecha_ult_conexion || 'En línea'}</p>

              <div className="info-action-buttons">
                <button 
                  className="btn-info-action btn-edit"
                  onClick={() => {
                    setShowInfoModal(false)
                    startEdit()
                  }}
                >
                  Editar contacto
                </button>
                <button 
                  className="btn-info-action btn-wallpaper"
                  onClick={() => {
                    setShowInfoModal(false)
                    setShowWallpaperModal(true)
                  }}
                >
                  Fondo del chat
                </button>
                <button 
                  className="btn-info-action btn-delete"
                  onClick={handleDelete}
                >
                  Eliminar contacto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallpaper Selection Mini Menu Modal (Centered inside Chat space) */}
      {showWallpaperModal && (
        <div className="chat-modal-overlay" onClick={() => setShowWallpaperModal(false)}>
          <div className="wallpaper-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wallpaper-modal-header">
              <h2>Fondo del chat</h2>
              <button 
                className="btn-close-modal" 
                onClick={() => setShowWallpaperModal(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            <p className="wallpaper-subtitle">
              Selecciona una imagen de fondo para este chat:
            </p>

            <div className="wallpaper-options-parallel">
              {WALLPAPERS.map((wp) => {
                const isSelected = currentWallpaper === wp.id
                return (
                  <div 
                    key={wp.id}
                    className={`wallpaper-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateContactById(contacto.id, { wallpaper: wp.id })
                    }}
                  >
                    <div className="wallpaper-thumbnail-wrapper">
                      {wp.isDefault ? (
                        <div 
                          className="wallpaper-thumb-img"
                          style={{ backgroundImage: 'var(--wa-chat-bg-image)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      ) : (
                        <img 
                          src={wp.src} 
                          alt={wp.title} 
                          className="wallpaper-thumb-img" 
                        />
                      )}
                      <span className="wallpaper-badge">{wp.name}</span>
                      {isSelected && <span className="selected-checkmark">✓</span>}
                    </div>
                    <span className="wallpaper-label">Opción {wp.name}</span>
                  </div>
                )
              })}
            </div>

            <div className="modal-buttons" style={{ marginTop: '20px' }}>
              <button 
                className="btn-success" 
                onClick={() => setShowWallpaperModal(false)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal (Centered inside Chat space) */}
      {showEditModal && (
        <div className="chat-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Contacto</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Última conexión / Estado</label>
                <input 
                  type="text" 
                  value={editConn} 
                  onChange={e => setEditConn(e.target.value)} 
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contact