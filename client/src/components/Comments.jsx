import { useEffect, useState } from "react";

import API from "../services/api";

import socket from "../services/socket";

import {
  SendHorizonal
} from "lucide-react";

function Comments({ taskId }) {

  const [comments, setComments] =
    useState([]);

  const [message, setMessage] =
    useState("");



  // 🟢 Fetch comments
  const fetchComments = async () => {

    try {

      const res = await API.get(
        `/comment/all?task_id=${taskId}`
      );

      setComments(res.data);

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Add comment
  const addComment = async () => {

    if (!message) return;

    try {

      await API.post(
        "/comment/add",
        {
          task_id: taskId,
          message
        }
      );

      setMessage("");

      fetchComments();

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Realtime
  useEffect(() => {

    fetchComments();

    socket.emit(
      "joinTask",
      taskId
    );

    socket.on(
      "commentAdded",
      () => {
        fetchComments();
      }
    );

    return () => {
      socket.off(
        "commentAdded"
      );
    };

  }, []);




  return (
    <div className="mt-4">

      {/* Header */}
      <h3 className="font-semibold mb-3">
        Discussion
      </h3>

      {/* Comment Input */}
      <div className="flex gap-2 mb-4">

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Write a comment..."
          className="flex-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl"
        />

        <button
          onClick={addComment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2"
        >
          <SendHorizonal size={18} />
        </button>

      </div>

      {/* Comments */}
      <div className="space-y-3 max-h-60 overflow-auto">

        {comments.map((c) => (

          <div
            key={c.id}
            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl"
          >

            <div className="flex items-start gap-3">

              {/* Avatar */}
              {c.avatar ? (
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs">
                  {c.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="flex-1">

                {/* Name */}
                <div className="flex justify-between">

                  <h4 className="font-semibold text-sm">
                    {c.name}
                  </h4>

                  <span className="text-xs text-gray-500">
                    {
                      new Date(
                        c.created_at
                      ).toLocaleString()
                    }
                  </span>

                </div>

                {/* Message */}
                <p className="mt-1 text-sm">
                  {c.message}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Comments;