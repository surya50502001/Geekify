import { useState, useEffect, useRef } from 'react';

function Messaging({ isDarkTheme, getCurrentColor }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load saved username
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsConnected(true);
    }

    // Load saved messages
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const saveMessages = (newMessages) => {
    localStorage.setItem('messages', JSON.stringify(newMessages));
  };

  const handleConnect = () => {
    if (username.trim()) {
      setIsConnected(true);
      localStorage.setItem('username', username);
      
      const welcomeMessage = {
        id: Date.now(),
        username: 'System',
        message: `${username} joined the chat`,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true
      };
      
      const updatedMessages = [...messages, welcomeMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && isConnected) {
      const message = {
        id: Date.now(),
        username: username,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
        isSystem: false
      };
      
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isConnected) {
        handleConnect();
      } else {
        sendMessage();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('messages');
  };

  const disconnect = () => {
    const disconnectMessage = {
      id: Date.now(),
      username: 'System',
      message: `${username} left the chat`,
      timestamp: new Date().toLocaleTimeString(),
      isSystem: true
    };
    
    const updatedMessages = [...messages, disconnectMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    
    setIsConnected(false);
    setUsername('');
    localStorage.removeItem('username');
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', color: getCurrentColor() }}>
          Join Chat
        </h2>
        
        <div style={{ 
          background: isDarkTheme ? '#181818' : '#f5f5f5', 
          borderRadius: '12px', 
          padding: '30px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill={getCurrentColor()}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '12px 16px',
              border: `2px solid ${getCurrentColor()}40`,
              borderRadius: '8px',
              background: isDarkTheme ? '#000' : '#fff',
              color: isDarkTheme ? '#fff' : '#000',
              fontSize: '16px',
              marginBottom: '20px',
              outline: 'none'
            }}
          />
          
          <button
            onClick={handleConnect}
            disabled={!username.trim()}
            style={{
              background: username.trim() ? getCurrentColor() : '#666',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: username.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '500'
            }}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${getCurrentColor()}40`
      }}>
        <h2 style={{ fontSize: '24px', margin: 0, color: getCurrentColor() }}>
          Chat Room
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#b3b3b3',
            background: isDarkTheme ? '#181818' : '#f5f5f5',
            padding: '6px 12px',
            borderRadius: '20px'
          }}>
            {username}
          </span>
          
          <button
            onClick={clearChat}
            style={{
              background: 'transparent',
              border: `1px solid ${getCurrentColor()}40`,
              color: getCurrentColor(),
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          
          <button
            onClick={disconnect}
            style={{
              background: '#e22856',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Leave
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: isDarkTheme ? '#181818' : '#f5f5f5',
        borderRadius: '12px',
        padding: '20px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#b3b3b3', 
            marginTop: '50px',
            fontSize: '16px'
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ 
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isSystem ? 'center' : (msg.username === username ? 'flex-end' : 'flex-start')
            }}>
              {msg.isSystem ? (
                <div style={{
                  background: getCurrentColor() + '20',
                  color: getCurrentColor(),
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  {msg.message}
                </div>
              ) : (
                <div style={{
                  maxWidth: '70%',
                  background: msg.username === username ? getCurrentColor() : (isDarkTheme ? '#2a2a2a' : '#e0e0e0'),
                  color: msg.username === username ? '#fff' : (isDarkTheme ? '#fff' : '#000'),
                  padding: '12px 16px',
                  borderRadius: '18px',
                  borderBottomRightRadius: msg.username === username ? '4px' : '18px',
                  borderBottomLeftRadius: msg.username === username ? '18px' : '4px'
                }}>
                  {msg.username !== username && (
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      marginBottom: '4px',
                      color: getCurrentColor()
                    }}>
                      {msg.username}
                    </div>
                  )}
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {msg.message}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    opacity: 0.7, 
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {msg.timestamp}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px',
        background: isDarkTheme ? '#181818' : '#f5f5f5',
        padding: '16px',
        borderRadius: '12px'
      }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: `2px solid ${getCurrentColor()}40`,
            borderRadius: '25px',
            background: isDarkTheme ? '#000' : '#fff',
            color: isDarkTheme ? '#fff' : '#000',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          style={{
            background: newMessage.trim() ? getCurrentColor() : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Messaging;