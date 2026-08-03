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
    getContactById,
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
  const [newContactPhone, setNewContactPhone] = useState("")
  const [newContactConn, setNewContactConn] = useState("En línea")
  
  // Menu and other modals state
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showStyleModal, setShowStyleModal] = useState(false)
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark')

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Create Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupAvatarColor, setGroupAvatarColor] = useState("#00a884")
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([])

  const [editingContact, setEditingContact] = useState(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editConn, setEditConn] = useState("")
  const [editUnread, setEditUnread] = useState(0)

  // Active filter tab ('all', 'unread', 'favorites', 'groups')
  const [activeFilter, setActiveFilter] = useState('all')

  // Filter contacts by query and active tab
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (activeFilter === 'unread') return c.mensajes_sin_ver > 0
    if (activeFilter === 'groups') return !!c.isGroup
    return true
  })

  // Handle create individual contact
  const handleCreate = (e) => {
    e.preventDefault()
    if (!newContactName.trim()) return
    const colors = ['#00a884', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    const created = createContact({
      nombre: newContactName,
      telefono: newContactPhone || "+54 9 11 1234-5678",
      fecha_ult_conexion: newContactConn || "En línea",
      mensajes_sin_ver: 0,
      avatarColor: randomColor,
      isGroup: false
    })
    
    setNewContactName("")
    setNewContactPhone("")
    setNewContactConn("En línea")
    setShowCreateModal(false)
    
    navigate(`/contact/${created.id}`)
  }

  // Handle create group
  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!groupName.trim()) return

    const memberNames = selectedGroupMembers.map(id => getContactById(id)?.nombre).filter(Boolean)
    const membersSummary = memberNames.length > 0 ? `${memberNames.length} miembros: ${memberNames.join(', ')}` : 'Sin miembros'

    const created = createContact({
      nombre: groupName,
      descripcion: groupDescription,
      isGroup: true,
      integrantes: selectedGroupMembers,
      telefono: membersSummary,
      fecha_ult_conexion: `Grupo · ${selectedGroupMembers.length} miembros`,
      avatarColor: groupAvatarColor || '#00a884',
      mensajes_sin_ver: 0
    })

    setGroupName("")
    setGroupDescription("")
    setSelectedGroupMembers([])
    setShowCreateGroupModal(false)

    navigate(`/contact/${created.id}`)
  }

  const toggleGroupMember = (id) => {
    if (selectedGroupMembers.includes(id)) {
      setSelectedGroupMembers(selectedGroupMembers.filter(mId => mId !== id))
    } else {
      setSelectedGroupMembers([...selectedGroupMembers, id])
    }
  }

  // Handle edit init
  const startEdit = (e, contact) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingContact(contact)
    setEditName(contact.nombre)
    setEditPhone(contact.telefono || "+54 9 11 1234-5678")
    setEditConn(contact.fecha_ult_conexion)
    setEditUnread(contact.mensajes_sin_ver)
  }

  // Handle edit save
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editName.trim() || !editingContact) return
    updateContactById(editingContact.id, {
      nombre: editName,
      telefono: editPhone,
      fecha_ult_conexion: editConn,
      mensajes_sin_ver: Number(editUnread)
    })
    setEditingContact(null)
  }

  // Handle delete
  const handleDelete = (e, id) => {
    e.stopPropagation()
    e.preventDefault()
    if (window.confirm("¿Estás seguro de que deseas eliminar este chat?")) {
      deleteContact(id)
      if (String(contact_id) === String(id)) {
        navigate("/")
      }
    }
  }

  const availableContactsForGroup = contacts.filter(c => !c.isGroup)

  return (
    <div className="whatsapp-sidebar">
      {/* Header matching WhatsApp Web design */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">WhatsApp</h1>
        <div className="header-actions">
          <button 
            className="icon-btn-action" 
            onClick={() => setShowCreateModal(true)}
            title="Crear Contacto / Nuevo Chat"
          >
            <span className="material-symbols-outlined">add_comment</span>
          </button>
          
          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn-action" 
              onClick={() => setShowMainMenu(!showMainMenu)}
              title="Menú"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {showMainMenu && (
              <div className="sidebar-dropdown-menu">
                <button onClick={() => { setShowMainMenu(false); setShowProfileModal(true) }}>Perfil</button>
                <button onClick={() => { setShowMainMenu(false); setShowStyleModal(true) }}>Estilo</button>
                <button onClick={() => { setShowMainMenu(false) }}>Cerrar Sesión</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon-symbol">search</span>
          <input
            type="text"
            placeholder="Buscar un chat o iniciar uno nuevo"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Filter Chips Bar (Todos, No leídos, Favoritos, Grupos, +) */}
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
          className={`filter-chip ${activeFilter === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveFilter('favorites')}
        >
          Favoritos
        </button>
        <button 
          className={`filter-chip ${activeFilter === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveFilter('groups')}
        >
          Grupos
        </button>
        <button 
          className="filter-chip chip-add" 
          onClick={() => setShowCreateGroupModal(true)}
          title="Crear nuevo grupo"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Contacts List */}
      <div className="contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="no-contacts">No se encontraron chats</div>
        ) : (
          filteredContacts.map((contact) => {
            const isActive = String(contact.id) === String(contact_id)
            const initials = contact.nombre.slice(0, 2).toUpperCase()
            const avatarStyle = {
              backgroundColor: contact.avatarColor || (contact.isGroup ? '#00a884' : '#3b82f6')
            }

            const contactMessages = messages.filter(m => String(m.contactId) === String(contact.id))
            const lastMessage = contactMessages[contactMessages.length - 1]
            const lastMessageText = lastMessage ? lastMessage.texto : (contact.isGroup ? "Grupo creado" : "No hay mensajes")
            const displayTime = lastMessage ? lastMessage.fecha : contact.fecha_ult_conexion

            return (
              <Link 
                to={`/contact/${contact.id}`} 
                key={contact.id} 
                className={`contact-item ${isActive ? 'active' : ''}`}
              >
                <div className="contact-avatar" style={avatarStyle}>
                  {contact.isGroup ? <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span> : initials}
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
              </Link>
            )
          })
        )}
      </div>

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
                <label>Teléfono</label>
                <input 
                  type="text" 
                  value={newContactPhone} 
                  onChange={e => setNewContactPhone(e.target.value)} 
                  placeholder="Ej: +54 9 11 4567-8901"
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

      {/* Dedicated Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-card group-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nuevo Grupo</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Nombre del Grupo</label>
                <input 
                  type="text" 
                  value={groupName} 
                  onChange={e => setGroupName(e.target.value)} 
                  placeholder="Ej: Equipo de Proyecto"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Descripción del Grupo</label>
                <textarea 
                  value={groupDescription} 
                  onChange={e => setGroupDescription(e.target.value)} 
                  placeholder="Escribe la descripción o propósito del grupo..."
                  rows="2"
                  className="group-description-input"
                />
              </div>

              <div className="form-group">
                <label>Foto de Perfil / Color del Grupo</label>
                <div className="color-picker-row">
                  {['#00a884', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'].map(color => (
                    <button 
                      key={color}
                      type="button"
                      className={`color-picker-btn ${groupAvatarColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setGroupAvatarColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Agregar Contactos Agendados ({selectedGroupMembers.length} seleccionados)</label>
                <div className="group-members-select-list">
                  {availableContactsForGroup.length === 0 ? (
                    <p className="no-members-text">No hay contactos agendados disponibles.</p>
                  ) : (
                    availableContactsForGroup.map(contact => {
                      const isChecked = selectedGroupMembers.includes(contact.id);
                      return (
                        <div 
                          key={contact.id} 
                          className={`member-select-item ${isChecked ? 'selected' : ''}`}
                          onClick={() => toggleGroupMember(contact.id)}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}} 
                          />
                          <div 
                            className="member-avatar-mini"
                            style={{ backgroundColor: contact.avatarColor || '#3b82f6' }}
                          >
                            {contact.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="member-info-mini">
                            <span className="member-name">{contact.nombre}</span>
                            <span className="member-phone">{contact.telefono}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateGroupModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="modal-overlay" onClick={() => setEditingContact(null)}>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Perfil</h2>
            <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
              <div className="profile-picture-container">
                <img src="/wallpapers/profile.jpg" alt="Perfil" className="profile-picture" />
                <div className="profile-picture-overlay">
                  <span className="material-symbols-outlined">add_a_photo</span>
                </div>
              </div>
              <h3 style={{ margin: 0 }}>Nombre: Luz Micol Moscardi</h3>
              <a 
                href="https://www.linkedin.com/in/luz-moscardi-7349b7209" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#0077b5',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            </div>
            <div className="modal-buttons" style={{ marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style Modal */}
      {showStyleModal && (
        <div className="modal-overlay" onClick={() => setShowStyleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Estilo</h2>
            <div className="style-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="light" 
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                />
                <span style={{ fontSize: '16px' }}>Claro</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark" 
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                />
                <span style={{ fontSize: '16px' }}>Oscuro</span>
              </label>
            </div>
            <div className="modal-buttons" style={{ marginTop: '30px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowStyleModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsappSidebar