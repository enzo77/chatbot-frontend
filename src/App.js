import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://127.0.0.1:5000/api';

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar conversaciones al iniciar
  useEffect(() => {
    cargarConversaciones();
  }, []);

  const cargarConversaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/conversaciones`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    }
  };

  const crearNuevaConversacion = () => {
    const newId = `conv_${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([]);
    setInput('');
  };

  const cargarConversacion = async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/conversaciones/${conversationId}`);
      const data = await res.json();
      setCurrentConversationId(conversationId);
      setMessages(data.messages);
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
        body: JSON.stringify({
          message: userMessage,
          conversation_id: currentConversationId
        })
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
      <div className="sidebar">
        <button className="new-chat-btn" onClick={crearNuevaConversacion}>
          ➕ Nueva conversación
        </button>
        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => cargarConversacion(conv.id)}
            >
              <div className="conv-preview">{conv.preview}</div>
              <button
                className="delete-btn"
                onClick={(e) => eliminarConversacion(conv.id, e)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-container">
        {!currentConversationId ? (
          <div className="empty-state">
            <h2>Bienvenido al Chatbot</h2>
            <p>Crea una nueva conversación para comenzar</p>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {loading && <div className="message assistant loading">Escribiendo...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form className="input-form" onSubmit={enviarMensaje}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? '⏳' : '📤'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;