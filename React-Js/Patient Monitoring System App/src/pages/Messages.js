import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/user/${user.userId}`);
      const convMap = new Map();
      res.data.forEach((msg) => {
        const otherId =
          msg.sender.userId === user.userId
            ? msg.receiver.userId
            : msg.sender.userId;
        const otherName =
          msg.sender.userId === user.userId
            ? msg.receiver.email
            : msg.sender.email;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            userId: otherId,
            name: otherName,
            lastMessage: msg.content,
            time: msg.sentAt,
          });
        }
      });
      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (otherUserId) => {
    setSelectedUser(otherUserId);
    try {
      const res = await API.get(
        `/messages/conversation/${user.userId}/${otherUserId}`
      );
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await API.post('/messages', {
        senderId: user.userId,
        receiverId: selectedUser,
        content: newMessage,
      });
      setNewMessage('');
      selectConversation(selectedUser);
      toast.success('Message sent!');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Messages</h1>
        <p>Communicate with patients and doctors</p>
      </motion.div>

      <motion.div
        className="messages-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="messages-list">
          <div className="messages-list-header">
            <FiMessageSquare style={{ marginRight: 8 }} />
            Conversations
          </div>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv, index) => (
              <motion.div
                key={conv.userId}
                className={`message-item ${
                  selectedUser === conv.userId ? 'active' : ''
                }`}
                onClick={() => selectConversation(conv.userId)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {conv.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="message-sender">{conv.name}</div>
                    <div className="message-preview">{conv.lastMessage}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                💬 Chat with{' '}
                {conversations.find((c) => c.userId === selectedUser)?.name}
              </div>
              <div className="chat-messages">
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.messageId}
                      className={`chat-bubble ${
                        msg.sender.userId === user.userId ? 'sent' : 'received'
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {msg.content}
                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.6,
                          marginTop: 6,
                        }}
                      >
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <motion.button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: 'auto', padding: '12px 20px' }}
                >
                  <FiSend />
                </motion.button>
              </div>
            </>
          ) : (
            <div
              className="empty-state"
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <motion.div
                className="empty-state-icon"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💬
              </motion.div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation to start chatting</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;