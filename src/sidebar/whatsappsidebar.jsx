import React, { useContext, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { WhatsappContext } from "../whatsappContext"

const formatTimeOnly = (fechaStr) => {
  if (!fechaStr) return '';
  if (fechaStr.includes(',')) {
    return fechaStr.split(',')[1].trim();
  }
  return fechaStr;
};

function WhatsappSidebar() {
  const { 
    contacts, 
    messages,
    createContact, 
    deleteContact, 
    updateContactById
  } = useContext(WhatsappContext)

  const { contact_id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Search query using react-router useSearchParams
  const searchQuery = searchParams.get("search") || ""

  const handleSearchChange = (e) => {
    const val = e.target.value
    if (val) {
      setSearchParams({ search: val })
    } else {
      setSearchParams({})
    }
  }

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [newContactConn, setNewContactConn] = useState("En línea")
  
  const [editingContact, setEditingContact] = useState(null) // holds contact object when editing
  const [editName, setEditName] = useState("")
  const [editConn, setEditConn] = useState("")
  const [editUnread, setEditUnread] = useState(0)

  // Filter contacts by query
  const filteredContacts = contacts.filter(c => 
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle create
  const handleCreate = (e) => {
    e.preventDefault()
    if (!newContactName.trim()) return
    const colors = ['#00a884', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    const created = createContact({
      nombre: newContactName,
      fecha_ult_conexion: newContactConn || "En línea",
      mensajes_sin_ver: 0,
      avatarColor: randomColor
    })
    
    setNewContactName("")
    setNewContactConn("En línea")
    setShowCreateModal(false)
    
    // Auto navigate to the newly created contact
    navigate(`/contact/${created.id}`)
  }

  // Handle edit init
  const startEdit = (e, contact) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingContact(contact)
    setEditName(contact.nombre)
    setEditConn(contact.fecha_ult_conexion)
    setEditUnread(contact.mensajes_sin_ver)
  }

  // Handle edit save
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editName.trim() || !editingContact) return
    updateContactById(editingContact.id, {
      nombre: editName,
      fecha_ult_conexion: editConn,
      mensajes_sin_ver: Number(editUnread)
    })
    setEditingContact(null)
  }

  // Handle delete
  const handleDelete = (e, id) => {
    e.stopPropagation()
    e.preventDefault()
    if (window.confirm("¿Estás seguro de que deseas eliminar este contacto y todos sus mensajes?")) {
      deleteContact(id)
      if (String(contact_id) === String(id)) {
        navigate("/")
      }
    }
  }

  return (
    <div className="whatsapp-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">Yo</div>
          <span className="user-title">Chats</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowCreateModal(true)}
            title="Crear Contacto"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar o empezar un nuevo chat"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="no-contacts">No se encontraron contactos</div>
        ) : (
          filteredContacts.map((contact) => {
            const isActive = String(contact.id) === String(contact_id)
            const initials = contact.nombre.slice(0, 2).toUpperCase()
            const avatarStyle = {
              backgroundColor: contact.avatarColor || '#3b82f6'
            }

            const contactMessages = messages.filter(m => String(m.contactId) === String(contact.id))
            const lastMessage = contactMessages[contactMessages.length - 1]
            const lastMessageText = lastMessage ? lastMessage.texto : "No hay mensajes"
            const displayTime = lastMessage ? lastMessage.fecha : contact.fecha_ult_conexion

            return (
              <Link 
                to={`/contact/${contact.id}`} 
                key={contact.id} 
                className={`contact-item ${isActive ? 'active' : ''}`}
              >
                <div className="contact-avatar" style={avatarStyle}>
                  {initials}
                </div>
                <div className="contact-info">
                  <div className="contact-info-top">
                    <h3>{contact.nombre}</h3>
                    <span className="contact-time">{formatTimeOnly(displayTime)}</span>
                  </div>
                  <div className="contact-info-bottom">
                    <span className="contact-last-message" title={lastMessageText}>
                      {lastMessageText}
                    </span>
                    <div className="contact-info-bottom-right">
                      {contact.mensajes_sin_ver > 0 && (
                        <span className="unread-badge">{contact.mensajes_sin_ver}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="contact-item-actions">
                  <button 
                    className="btn-action-edit"
                    onClick={(e) => startEdit(e, contact)}
                    title="Editar contacto"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action-delete"
                    onClick={(e) => handleDelete(e, contact.id)}
                    title="Eliminar contacto"
                  >
                    🗑️
                  </button>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Crear Nuevo Contacto</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  value={newContactName} 
                  onChange={e => setNewContactName(e.target.value)} 
                  placeholder="Ej: Pepe Argento"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Última conexión / Estado</label>
                <input 
                  type="text" 
                  value={newContactConn} 
                  onChange={e => setNewContactConn(e.target.value)} 
                  placeholder="Ej: En línea, Ayer, Hace 1 hora"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="modal-overlay">
          <div className="modal-card">
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
                <label>Última conexión</label>
                <input 
                  type="text" 
                  value={editConn} 
                  onChange={e => setEditConn(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Mensajes no leídos</label>
                <input 
                  type="number" 
                  min="0"
                  value={editUnread} 
                  onChange={e => setEditUnread(e.target.value)} 
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setEditingContact(null)}>
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

export default WhatsappSidebar