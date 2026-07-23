import React, { createContext, useState, useEffect } from 'react';
import initialContacts from './contacts';

export const WhatsappContext = createContext();

const initialMessages = [
  { id: 1, contactId: 1, texto: "¡Hola! ¿Cómo va todo?", fecha: "10:30", sentByMe: false },
  { id: 2, contactId: 1, texto: "¡Todo bien! ¿Y vos qué contás?", fecha: "10:32", sentByMe: true },
  { id: 3, contactId: 1, texto: "Por acá terminando unas cosas del curso.", fecha: "10:33", sentByMe: false },
  { id: 4, contactId: 2, texto: "Che, ¿sale algo hoy a la noche?", fecha: "15:00", sentByMe: false },
  { id: 5, contactId: 2, texto: "¡Estaba por preguntarte lo mismo! Sí, dale.", fecha: "15:05", sentByMe: true },
  { id: 6, contactId: 3, texto: "¿Terminaste de armar el proyecto nuevo?", fecha: "18:45", sentByMe: false }
];

export function WhatsappProvider({ children }) {
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('whatsapp_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('whatsapp_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem('whatsapp_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('whatsapp_messages', JSON.stringify(messages));
  }, [messages]);

  // 1. Get contact by ID
  const getContactById = (contactId) => {
    return contacts.find(c => String(c.id) === String(contactId));
  };

  // 2. Get message by ID
  const getMessageById = (messageId) => {
    return messages.find(m => String(m.id) === String(messageId));
  };

  // 3. Create Contact
  const createContact = (contactData) => {
    const newContact = {
      id: Date.now(),
      nombre: contactData.nombre || 'Sin nombre',
      fecha_ult_conexion: contactData.fecha_ult_conexion || 'Desconectado',
      mensajes_sin_ver: contactData.mensajes_sin_ver || 0,
      avatarColor: contactData.avatarColor || '#3b82f6' // Default color
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  // 4. Delete Contact (and its messages)
  const deleteContact = (contactId) => {
    setContacts(prev => prev.filter(c => String(c.id) !== String(contactId)));
    setMessages(prev => prev.filter(m => String(m.contactId) !== String(contactId)));
  };

  // 5. Create Message
  const createMessage = (messageData) => {
    const now = new Date();
    const formattedDate = now.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const newMessage = {
      id: Date.now(),
      contactId: messageData.contactId,
      texto: messageData.texto || '',
      fecha: formattedDate,
      sentByMe: messageData.sentByMe !== undefined ? messageData.sentByMe : true
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // 6. Delete Message
  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));
  };

  // 7. Update contact by ID
  const updateContactById = (contactId, updatedData) => {
    setContacts(prev => prev.map(c => {
      if (String(c.id) === String(contactId)) {
        return { ...c, ...updatedData };
      }
      return c;
    }));
  };

  return (
    <WhatsappContext.Provider value={{
      contacts,
      messages,
      getContactById,
      getMessageById,
      createContact,
      deleteContact,
      createMessage,
      deleteMessage,
      updateContactById
    }}>
      {children}
    </WhatsappContext.Provider>
  );
}
