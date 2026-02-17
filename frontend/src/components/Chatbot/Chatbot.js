import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import API from '../../Services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your Agri-Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { sender: 'bot', text: 'Please log in to use the assistant.' }]);
                    setLoading(false);
                }, 500);
                return;
            }

            const user = JSON.parse(userStr);

            const response = await API.post('/chatbot/query', {
                message: userMessage.text,
                userId: user.id
            });

            const botMessage = { sender: 'bot', text: response.data.response };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    // Removed the "if (!user) return null" check to ensure visibility


    return (
        <div className="chatbot-container">
            {/* Floating Button */}
            {!isOpen && (
                <div className="chatbot-button" onClick={toggleChat}>
                    <span className="chatbot-icon">🤖</span>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <span>Agri-Assistant</span>
                        <button className="close-btn" onClick={toggleChat}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="message bot-message">Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={handleSendMessage} disabled={loading}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
