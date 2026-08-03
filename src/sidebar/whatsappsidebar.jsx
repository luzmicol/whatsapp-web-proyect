import React, { useContext, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { WhatsappContext } from "../whatsappContext"

function WhatsappSidebar() {
  const { contacts, messages } = useContext(WhatsappContext)
  const { contact_id } = useParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  // Helper to get last message
  const getLastMessage = (cId) => {
    const chatMsgs = messages.filter(m => String(m.contactId) === String(cId))
    if (chatMsgs.length === 0) return null
    return chatMsgs[chatMsgs.length - 1]
  }

  // Filter contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    
    if (activeFilter === "unread") return c.mensajes_sin_ver > 0
    if (activeFilter === "groups") return c.isGroup
    return true
  })

  return (
    <div className="whatsapp-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Chats</h2>
        <div className="header-actions">
          <button className="icon-btn-action">
            <span className="material-symbols-outlined">chat</span>
          </button>
          <button className="icon-btn-action">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon-symbol">search</span>
          <input 
            type="text" 
            placeholder="Buscar o empezar un chat nuevo" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-chips-bar">
        <button 
          className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Todos
        </button>
        <button 
          className={`filter-chip ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          No leídos
        </button>
        <button 
          className={`filter-chip ${activeFilter === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveFilter('groups')}
        >
          Grupos
        </button>
      </div>

      <div className="contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="no-contacts">No se encontraron chats</div>
        ) : (
          filteredContacts.map((contact) => {
            const lastMsg = getLastMessage(contact.id)
            const isActive = String(contact.id) === String(contact_id)
            
            return (
              <Link 
                to={`/contact/${contact.id}`} 
                key={contact.id}
                className={`contact-item ${isActive ? 'active' : ''}`}
              >
                <div 
                  className="contact-avatar" 
                  style={{ backgroundColor: contact.avatarColor || '#3b82f6' }}
                >
                  {contact.isGroup ? (
                    <span className="material-symbols-outlined">group</span>
                  ) : (
                    contact.nombre.slice(0, 2).toUpperCase()
                  )}
                </div>
                
                <div className="contact-info">
                  <div className="contact-info-top">
                    <h3>{contact.nombre}</h3>
                    <span className="contact-time">
                      {lastMsg ? lastMsg.fecha : contact.fecha_ult_conexion}
                    </span>
                  </div>
                  
                  <div className="contact-info-bottom">
                    <span className="contact-last-message">
                      {lastMsg ? (
                        <>
                          {lastMsg.sentByMe && (
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px', color: '#53bdeb' }}>
                              done_all
                            </span>
                          )}
                          {lastMsg.texto}
                        </>
                      ) : (
                        contact.descripcion || 'Toca para chatear'
                      )}
                    </span>
                    
                    <div className="contact-info-bottom-right">
                      {contact.mensajes_sin_ver > 0 && (
                        <div className="unread-badge">{contact.mensajes_sin_ver}</div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

export default WhatsappSidebar