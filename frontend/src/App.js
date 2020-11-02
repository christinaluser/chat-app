import React, { useState, useEffect, useRef } from 'react';
import "./App.css"
import io from 'socket.io-client';
import moment from "moment";

const App = () => {
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('/');

    socketRef.current.on("your id", id => {
      setYourID(id);
    })

    socketRef.current.on("message", (message, date) => {
      receivedMessage(message);
    })
  }, []);

  function receivedMessage(message) {
    setMessages(oldMsgs => [...oldMsgs, message]);
  }

  function sendMessage(e) {
    e.preventDefault();
    const messageObject = {
      body: message,
      id: yourID,
    };
    setMessage("");
    socketRef.current.emit("send message", messageObject);
  }

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  return (
    <div className="page">
      <div className="chat-wrapper">
        <div className="messages-container">
          {messages.map((message, index) => {
            if (message.id === yourID) {
              return (
                <div className="row" key={index}>
                  <div className="message">
                    {message.id}: {message.body} {moment(message.timeStamp).format("LLL")}
                  </div>
                </div>
              )
            }
            return (
              <div className="partner-row" key={index}>
                <div className="partner-message">
                  {message.id}: {message.body} {message.body} {moment(message.timeStamp).format("LLL")}
                </div>
              </div>
            )
          })}
        </div>
        <form onSubmit={sendMessage}>
          <textarea value={message} onChange={handleMessageChange} placeholder="Type a message..." />
          <button>Send</button>
        </form>
      </div>
      <div className="user-panel">
        placeholder
      </div> 
    </div>
  );
};

export default App;
