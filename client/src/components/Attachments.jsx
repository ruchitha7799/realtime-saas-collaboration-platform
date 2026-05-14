import { useEffect, useState } from "react";

import API from "../services/api";

import socket from "../services/socket";

import {
  Paperclip,
  Upload,
  Download
} from "lucide-react";

function Attachments({ taskId }) {

  const [attachments, setAttachments] =
    useState([]);

  const [file, setFile] =
    useState(null);



  // 🟢 Fetch attachments
  const fetchAttachments = async () => {

    try {

      const res = await API.get(
        `/attachment/all?task_id=${taskId}`
      );

      setAttachments(res.data);

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Upload file
  const uploadFile = async () => {

    if (!file) return;

    try {

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "task_id",
        taskId
      );

      await API.post(
        "/attachment/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setFile(null);

      fetchAttachments();

    } catch (error) {
      console.log(error);
    }
  };



  // 🟢 Realtime
  useEffect(() => {

    fetchAttachments();

    socket.emit(
      "joinTask",
      taskId
    );

    socket.on(
      "attachmentAdded",
      () => {
        fetchAttachments();
      }
    );

    return () => {
      socket.off(
        "attachmentAdded"
      );
    };

  }, []);




  return (
    <div className="mt-4">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">

        <Paperclip size={18} />

        <h3 className="font-semibold">
          Attachments
        </h3>

      </div>

      {/* Upload */}
      <div className="flex gap-2 mb-4">

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="flex-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl"
        />

        <button
          onClick={uploadFile}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2"
        >
          <Upload size={18} />
        </button>

      </div>

      {/* Files */}
      <div className="space-y-2">

        {attachments.map((a) => (

          <div
            key={a.id}
            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl flex justify-between items-center"
          >

            <div className="flex items-center gap-2">

              <Paperclip size={16} />

              <span className="text-sm">
                {a.file_name}
              </span>

            </div>

            <a
              href={a.file_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 flex items-center gap-1"
            >
              <Download size={16} />
            </a>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Attachments;