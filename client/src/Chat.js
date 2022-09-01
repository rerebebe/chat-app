import { useState, useContext, useEffect } from "react";
import { ChatContext } from "./helpers/ChatContext";
import ScrollToBottom from "react-scroll-to-bottom";
import { useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const { socket, userName, room } = useContext(ChatContext);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: sessionStorage.getItem("room"),
        author: sessionStorage.getItem("name"),
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", {
        room: sessionStorage.getItem("room"),
        author: sessionStorage.getItem("name"),
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      });

      setMessageList((list) => {
        return [...list, messageData];
      });
      setCurrentMessage("");
    }
  };
  // client side will get the chat history from the MongoDB
  useEffect(() => {
    socket.emit("output-message", { room: sessionStorage.getItem("room") });
    socket.on("output-message", (history) => {
      // console.log(history.map((chat) => chat.chatName));
      // console.log(history);
      setMessageList(history);
    });
  }, []);
  // when you send message, the other client will receive message right away
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>

      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={
                  sessionStorage.getItem("name") === messageContent.author
                    ? "other"
                    : "you"
                }
              >
                <div className="message-content">
                  <div className="messageitself">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
      <button
        className="EndChat"
        onClick={() => {
          sessionStorage.clear();
          navigate("/");
        }}
      >
        End chat
      </button>
    </div>
  );
}

export default Chat;
