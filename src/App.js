import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
    <line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

const IconMsg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const cargarConversaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/conversaciones`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    }
  }, []);

  useEffect(() => {
    cargarConversaciones();
  }, [cargarConversaciones]);

  const crearNuevaConversacion = () => {
    const newId = `conv_${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([]);
    setInput('');
    setSidebarOpen(false);
  };

  const cargarConversacion = async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/conversaciones/${conversationId}`);
      const data = await res.json();
      setCurrentConversationId(conversationId);
      setMessages(data.messages);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error cargando conversación:', error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentConversationId) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversation_id: currentConversationId })
      });
      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
        cargarConversaciones();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el servidor', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarConversacion = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/conversaciones/${conversationId}`, { method: 'DELETE' });
      cargarConversaciones();
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error eliminando conversación:', error);
    }
  };

  return (
    <div className="app">

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo192.png" alt="Logo" className="sidebar-logo" />
          <span className="sidebar-brand">NA IA ASISTETNTE</span>
        </div>

        <button className="new-chat-btn" onClick={crearNuevaConversacion}>
          <IconPlus /> Nueva conversación
        </button>

        <div className="conversations-label">Historial</div>

        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => cargarConversacion(conv.id)}
            >
              <span className="conv-icon"><IconMsg /></span>
              <div className="conv-preview">{conv.preview}</div>
              <button
                className="delete-btn"
                onClick={(e) => eliminarConversacion(conv.id, e)}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT ── */}
      <div className="chat-container">
        {!currentConversationId ? (
          <>
            <div className="mobile-topbar">
              <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
                <IconMenu />
              </button>
            </div>

            <div className="empty-state">
              <img src="/logo192.png" alt="Logo" className="empty-logo" />
              <h2>Bienvenido al ChANtbot</h2>
              {/* <p>Tu PADRINO asistente artificial</p> */}
              <button className="empty-hint" onClick={crearNuevaConversacion}>
                <IconPlus /> Crea una nueva conversación con el Padrino para empezar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="chat-topbar">
              <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
                <IconMenu />
              </button>
              <span className="topbar-dot" />
              <span className="topbar-label">IA · en línea</span>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message assistant loading">
                  <div className="message-content">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <form className="input-form" onSubmit={enviarMensaje}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`send-btn${loading ? ' spinning' : ''}`}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <IconSpinner /> : <IconSend />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default App;
