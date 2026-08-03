import React, { createContext, useState, useEffect } from 'react';
import initialContacts from './contacts';

export const WhatsappContext = createContext();

const initialMessages = [
  { id: 1, contactId: 1, texto: "¡Hola! ¿Cómo va todo?", fecha: "10:30 a. m.", sentByMe: false },
  { id: 2, contactId: 1, texto: "¡Todo bien! ¿Y vos qué contás?", fecha: "10:32 a. m.", sentByMe: true },
  { id: 3, contactId: 1, texto: "Por acá terminando unas cosas del curso.", fecha: "10:33 a. m.", sentByMe: false },
  { id: 4, contactId: 2, texto: "Che, ¿sale algo hoy a la noche?", fecha: "3:00 p. m.", sentByMe: false },
  { id: 5, contactId: 2, texto: "¡Estaba por preguntarte lo mismo! Sí, dale.", fecha: "3:05 p. m.", sentByMe: true },
  { id: 6, contactId: 3, texto: "¿Terminaste de armar el proyecto nuevo?", fecha: "6:45 p. m.", sentByMe: false },
  { id: 7, contactId: 4, texto: "Chicos, ¿pudieron avanzar con el trabajo práctico de React?", fecha: "11:47 a. m.", sentByMe: false },
  { id: 8, contactId: 4, texto: "Sí, yo ya armé los componentes base. Me falta estilizar.", fecha: "11:50 a. m.", sentByMe: false },
  { id: 9, contactId: 4, texto: "¡Buenísimo! Yo me encargo de armar el estado global y los contextos esta noche.", fecha: "10:48 p. m.", sentByMe: true }
];

export function WhatsappProvider({ children }) {
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('whatsapp_contacts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge missing contacts from initialContacts
      const missingContacts = initialContacts.filter(ic => !parsed.find(pc => pc.id === ic.id));
      const combined = [...parsed, ...missingContacts];
      return combined.map(c => ({
        telefono: "+54 9 11 1234-5678",
        wallpaper: "4",
        ...c
      }));
    }
    return initialContacts;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('whatsapp_messages');
    if (saved) {
      let parsed = JSON.parse(saved);
      // If the old dummy messages exist, replace them with the new study group ones
      const hasOldDummy = parsed.find(m => m.id === 7 && m.texto === "62678");
      if (hasOldDummy) {
        parsed = parsed.filter(m => m.contactId !== 4);
        parsed = [...parsed, ...initialMessages.filter(m => m.contactId === 4)];
      }
      return parsed;
    }
    return initialMessages;
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
      telefono: contactData.telefono || `+54 9 11 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      fecha_ult_conexion: contactData.fecha_ult_conexion || 'Desconectado',
      mensajes_sin_ver: contactData.mensajes_sin_ver || 0,
      avatarColor: contactData.avatarColor || '#3b82f6',
      wallpaper: contactData.wallpaper || '4',
      isGroup: !!contactData.isGroup,
      descripcion: contactData.descripcion || '',
      integrantes: contactData.integrantes || []
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
    const hours24 = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours24 >= 12 ? 'p. m.' : 'a. m.';
    const hours12 = hours24 % 12 || 12;
    const formattedTime = `${hours12}:${minutes} ${ampm}`;
    
    const newMessage = {
      id: Date.now(),
      contactId: messageData.contactId,
      texto: messageData.texto || '',
      fecha: formattedTime,
      timestamp: now.getTime(),
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
