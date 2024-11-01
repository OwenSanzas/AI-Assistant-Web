import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (sessionId) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/get_history?session_id=${sessionId}`);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newMessage = { sender: "User", text: input || "PDF Question" };
    setMessages([...messages, newMessage]);

    setInput("");

    let responseMessage;

    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("question", input);

      try {
        const response = await axios.post("http://127.0.0.1:8000/upload_pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSessionId(response.data.session_id);
        responseMessage = { sender: "AI", text: response.data.message };
      } catch (error) {
        responseMessage = { sender: "AI", text: "Error occurred while processing your request." };
      }
    } else if (sessionId && files.length > 0) {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("question", input);

      try {
        const response = await axios.post("http://127.0.0.1:8000/ask_question", formData);
        responseMessage = { sender: "AI", text: response.data.message };
      } catch (error) {
        responseMessage = { sender: "AI", text: "Error occurred while processing your request." };
      }
    } else {
      try {
        const response = await axios.post("http://127.0.0.1:8000/process_input", { user_input: input, session_id: sessionId });
        if (!sessionId) setSessionId(response.data.session_id);
        responseMessage = { sender: "AI", text: response.data.message };
      } catch (error) {
        responseMessage = { sender: "AI", text: "Error occurred while processing your request." };
      }
    }

    setMessages((prevMessages) => [...prevMessages, responseMessage]);
    setFiles([]);
    setFileNames([]);
  };

  return (
    <div className="App">
      <h1>AI Assistant</h1>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <strong>{msg.sender}:</strong>{" "}
            {msg.sender === "AI" ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="form-container">
        <label className="file-input-label">
          Select PDF Files
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        <div className="file-names">
          {fileNames.map((name, index) => (
            <div key={index} className="file-name">{name}</div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a question or command..."
          value={input}
          onChange={handleInputChange}
          className="text-input"
        />
        <button
          type="submit"
          className={`submit-button ${input.trim() === "" ? "disabled" : ""}`}
          disabled={input.trim() === ""}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
