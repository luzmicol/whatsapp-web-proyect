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
  { id: 7, contactId: 4, texto: "Chicos, ¿pudieron avanzar con el trabajo práctico de React?", fecha: "11:47 a. m.", sentByMe: false, senderId: 1 },
  { id: 8, contactId: 4, texto: "Sí, yo ya armé los componentes base. Me falta estilizar.", fecha: "11:50 a. m.", sentByMe: false, senderId: 2 },
  { id: 9, contactId: 4, texto: "¡Buenísimo! Yo me encargo de armar el estado global y los contextos esta noche.", fecha: "10:48 p. m.", sentByMe: true },
  { id: 10, contactId: 5, texto: "¡Hola! ¿Viste los apuntes de la clase?", fecha: "10:15 a. m.", sentByMe: false },
  { id: 11, contactId: 5, texto: "Hola, sí los vi, gracias por mandarlos.", fecha: "10:20 a. m.", sentByMe: true },
  { id: 12, contactId: 6, texto: "¿Vamos a merendar más tarde?", fecha: "4:00 p. m.", sentByMe: false },
  { id: 13, contactId: 6, texto: "Dale, te aviso cuando me desocupe.", fecha: "4:05 p. m.", sentByMe: true },
  { id: 14, contactId: 7, texto: "Che, ¿me pasas el código del último TP?", fecha: "9:00 a. m.", sentByMe: false },
  { id: 15, contactId: 7, texto: "Ahora te lo subo al repo y te paso el link.", fecha: "9:15 a. m.", sentByMe: true },
  { id: 16, contactId: 8, texto: "Feliz cumple!! 🎉 Pasalo lindo.", fecha: "12:00 a. m.", sentByMe: false },
  { id: 17, contactId: 8, texto: "Muchas gracias!! Nos vemos el finde.", fecha: "9:00 a. m.", sentByMe: true },
  { id: 18, contactId: 9, texto: "¿Sale partido hoy a las 20?", fecha: "5:30 p. m.", sentByMe: false },
  { id: 19, contactId: 9, texto: "De una, llevo la pelota.", fecha: "5:45 p. m.", sentByMe: true }
];

export function WhatsappProvider({ children }) {
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('whatsapp_contacts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge missing contacts from initialContacts
      const missingContacts = initialContacts.filter(ic => !parsed.find(pc => pc.id === ic.id));
      const combined = [...parsed, ...missingContacts];
      return combined.map(c => {
        const initialDef = initialContacts.find(ic => ic.id === c.id);
        const merged = {
          telefono: "+54 9 11 1234-5678",
          wallpaper: "4",
          ...c
        };
        if (initialDef && initialDef.avatar && !merged.avatar) {
          merged.avatar = initialDef.avatar;
        }
        return merged;
      });
    }
    return initialContacts;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('whatsapp_messages');
    if (saved) {
      let parsed = JSON.parse(saved);
      // Ensure the new study group messages are shown, replacing old state for contact 4
      const hasNewStudyMessages = parsed.some(m => String(m.contactId) === "4" && m.texto.includes("Chicos, ¿pudieron avanzar"));
      if (!hasNewStudyMessages) {
        parsed = parsed.filter(m => String(m.contactId) !== "4");
        parsed = [...parsed, ...initialMessages.filter(m => String(m.contactId) === "4")];
      }

      // Merge messages for any new contacts that might not be in localStorage yet
      const existingContactIds = new Set(parsed.map(m => String(m.contactId)));
      const missingMessages = initialMessages.filter(im => !existingContactIds.has(String(im.contactId)));
      if (missingMessages.length > 0) {
        parsed = [...parsed, ...missingMessages];
      }

      // Auto-migrate old group messages that don't have a senderId (fixing missing names/avatars)
      let migrated = false;
      parsed = parsed.map(m => {
        if (String(m.contactId) === "4" && !m.sentByMe) {
          if (m.id === 7 && m.senderId !== 1) {
            migrated = true;
            return { ...m, senderId: 1 };
          }
          if (m.id === 8 && m.senderId !== 2) {
            migrated = true;
            return { ...m, senderId: 2 };
          }
          if (!m.senderId) {
            migrated = true;
            return { ...m, senderId: Math.random() > 0.5 ? 1 : 2 };
          }
        }
        return m;
      });
      
      if (migrated) {
        localStorage.setItem('whatsapp_messages', JSON.stringify(parsed));
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
      sentByMe: messageData.sentByMe !== undefined ? messageData.sentByMe : true,
      senderId: messageData.senderId
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
