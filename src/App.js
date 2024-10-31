import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newMessage = { sender: "User", text: input };
    setMessages([...messages, newMessage]);

    let responseMessage;

    // 根据用户输入内容选择功能
    if (input.toLowerCase().includes("upload pdf") || input.toLowerCase().includes("ask question")) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("question", input);

      try {
        const response = await axios.post("http://127.0.0.1:8000/upload_pdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        responseMessage = { sender: "AI", text: response.data.message };
      } catch (error) {
        responseMessage = { sender: "AI", text: "Error occurred while processing your request." };
      }
    } else if (input.toLowerCase().includes("send email")) {
      responseMessage = { sender: "AI", text: "Email functionality is not implemented yet." };
    } else if (input.toLowerCase().includes("schedule meeting")) {
      responseMessage = { sender: "AI", text: "Meeting scheduling is not implemented yet." };
    } else if (input.toLowerCase().includes("search the internet")) {
      responseMessage = { sender: "AI", text: "Internet search functionality is not implemented yet." };
    } else {
      responseMessage = { sender: "AI", text: "Sorry, I didn't understand your command." };
    }

    setMessages([...messages, newMessage, responseMessage]);
    setInput("");
  };

  return (
    <div className="App">
      <h1>AI Assistant</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Type a command..."
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
