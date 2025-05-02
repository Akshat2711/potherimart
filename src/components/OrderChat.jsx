import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { ref as dbRef, onValue, push, set, remove } from 'firebase/database';
import './OrderChat.css';

export const OrderChat = ({ orderId, orderedBy, deliveryPerson }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = localStorage.getItem('user');
  const isDeliveryPerson = currentUser === deliveryPerson;

  // Fetch messages for this specific order
  useEffect(() => {
    if (!orderId || !orderedBy || !deliveryPerson) {
      setLoading(false);
      return;
    }

    const chatRef = dbRef(db, `potherimart/chats/${orderId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and sort by timestamp
        const messageArray = Object.entries(data).map(([msgId, msgData]) => ({
          id: msgId,
          ...msgData
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageArray);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, orderedBy, deliveryPerson]);

  // Send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const chatRef = dbRef(db, `potherimart/chats/${orderId}`);
    const newMessageRef = push(chatRef);
    
    set(newMessageRef, {
      text: newMessage,
      sender: currentUser,
      timestamp: Date.now(),
      senderRole: isDeliveryPerson ? 'delivery' : 'customer'
    });
    
    setNewMessage('');
  };

  return (
    <div className="order-chat">
      <div className="chat-header">
        <h3>Order Chat</h3>
        <p className="chat-participants">
          {isDeliveryPerson ? `Chatting with: ${orderedBy}` : `Chatting with: ${deliveryPerson}`}
        </p>
      </div>
      
      <div className="chat-messages">
        {loading ? (
          <p className="loading-message">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === currentUser ? 'my-message' : 'other-message'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};