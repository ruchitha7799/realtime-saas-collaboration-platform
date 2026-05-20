import { useEffect, useState } from "react";

import API from "../services/api";

import socket from "../services/socket";

import {
  SendHorizonal
} from "lucide-react";

function TeamChat() {

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const projectId =
    localStorage.getItem("projectId");



  // 🟢 Fetch messages
  const fetchMessages = async () => {

    try {

      const res = await API.get(
        `/chat/all?project_id=${projectId}`
      );

      setMessages(res.data);

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Send message
  const sendMessage = async () => {

    if (!message) return;

    try {

      await API.post(
        "/chat/send",
        {
          project_id: projectId,
          message
        }
      );

      setMessage("");

      fetchMessages();

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Realtime
  useEffect(() => {

    fetchMessages();

    socket.emit(
      "joinProject",
      projectId
    );

    socket.on(
      "newMessage",
      () => {
        fetchMessages();
      }
    );

    return () => {
      socket.off(
        "newMessage"
      );
    };

  }, []);




  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 h-[600px] flex flex-col">

      {/* Header */}
      <div className="border-b dark:border-gray-700 pb-3 mb-4">

        <h2 className="text-xl font-bold">
          Team Chat 💬
        </h2>

        <p className="text-sm text-gray-500">
          Realtime collaboration
        </p>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-4 pr-2">

        {messages.map((m) => (

          <div
            key={m.id}
            className="flex gap-3"
          >

            {/* Avatar */}
            {m.avatar ? (
              <img
                src={m.avatar}
                alt={m.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs">
                {m.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            {/* Message */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl max-w-[80%]">

              <div className="flex items-center gap-2">

                <h3 className="font-semibold text-sm">
                  {m.name}
                </h3>

                <span className="text-xs text-gray-500">
                  {
                    new Date(
                      m.created_at
                    ).toLocaleTimeString()
                  }
                </span>

              </div>

              <p className="mt-1 text-sm">
                {m.message}
              </p>

            </div>

          </div>
        ))}

      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-xl flex items-center gap-2 transition"
        >
          <SendHorizonal size={18} />
        </button>

      </div>

    </div>
  );
}

export default TeamChat;