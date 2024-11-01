import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import EmailCard from './EmailCard';
import PreviewMeeting from './MeetingPreview';
import config from './config';
import './App.css';

const backendUrl = config.backendUrl;
const ENV = process.env.ENV;

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);
  const [meetingPreview, setMeetingPreview] = useState(null); // State for meeting preview
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  console.log("backendUrl:", backendUrl);
  console.log('ENV:', ENV);

  useEffect(() => {
    const fetchHistory = async () => {
      if (sessionId) {
        try {
          const response = await axios.get(`${backendUrl}/get_history?session_id=${sessionId}`);
          setMessages(response.data.history);
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      }
    };
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
    setFileNames(Array.from(selectedFiles).map((file) => file.name));
  };

  const formatMessageContent = (content) => {
    if (typeof content === 'string') {
      return content.replace(/```markdown\n|```\n?/g, '');
    }
    if (content && typeof content === 'object') {
      if (content.type === 'email_preview') {
        return "I've prepared an email preview for you. Please review it.";
      } else if (content.type === 'meeting_scheduled') {
        return "I've prepared a meeting preview for you. Please review it.";
      }
      return content.message || content.text || JSON.stringify(content);
    }
    return String(content);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const newMessage = { sender: "User", text: input || "PDF Question" };
    setMessages([...messages, newMessage]);
    setInput("");
    setIsLoading(true);

    let responseMessage;

    try {
      if (files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        formData.append("question", input);

        const response = await axios.post(`${backendUrl}/upload_pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        setSessionId(response.data.session_id);
        responseMessage = { 
          sender: "AI", 
          text: formatMessageContent(response.data.message)
        };
      } else {
        const response = await axios.post(`${backendUrl}/process_input`, {
          user_input: input,
          session_id: sessionId
        });

        if (response.data.type === "email_preview") {
          setEmailPreview(response.data.data);
          responseMessage = {
            sender: "AI",
            text: "I've prepared an email preview for you. Please review it."
          };
        } else if (response.data.type === "meeting_scheduled") {
          setMeetingPreview(response.data.data);
          responseMessage = {
            sender: "AI",
            text: "I've prepared a meeting preview for you. Please review it."
          };
        } else {
          if (!sessionId) setSessionId(response.data.session_id);
          responseMessage = { 
            sender: "AI", 
            text: formatMessageContent(response.data.message)
          };
        }
      }
    } catch (error) {
      responseMessage = { 
        sender: "AI", 
        text: "Error occurred while processing your request." 
      };
    } finally {
      setIsLoading(false);
      setMessages(prev => [...prev, responseMessage]);
      setFiles([]);
      setFileNames([]);
    }
  };

  const renderMessage = (msg) => {
    const content = formatMessageContent(msg.text);
    
    return (
      <div className={`message ${msg.sender}`}>
        <div className="message-header">
          <strong>{msg.sender}</strong>
        </div>
        <div className="message-body">
          {msg.sender === "AI" ? (
            <div className="markdown-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>AI Assistant</h1>
      </header>

      <main className="app-main">
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index}>
              {renderMessage(msg)}
            </div>
          ))}
          {isLoading && (
            <div className="message AI">
              <div className="message-header">
                <strong>AI</strong>
              </div>
              <div className="message-body">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="file-input-container">
            <label className="file-input-label">
              <span>Upload PDF</span>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden-file-input"
              />
            </label>
          </div>

          <div className="file-names">
            {fileNames.map((name, index) => (
              <div key={index} className="file-name">
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = Array.from(files).filter((_, i) => i !== index);
                    setFiles(newFiles);
                    setFileNames(newFiles.map(f => f.name));
                  }}
                  className="remove-file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="input-container">
            <textarea
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="message-input"
            />
            <button
              type="submit"
              className={`submit-button ${(!input.trim() && files.length === 0) ? "disabled" : ""}`}
              disabled={!input.trim() && files.length === 0}
            >
              Send
            </button>
          </div>
        </form>
      </main>

      {emailPreview && (
        <EmailCard
          emailData={emailPreview}
          onClose={() => setEmailPreview(null)}
          isLoading={isLoading}
        />
      )}
      
      {meetingPreview && (
        <PreviewMeeting
          meetingData={meetingPreview}
          onClose={() => setMeetingPreview(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;
