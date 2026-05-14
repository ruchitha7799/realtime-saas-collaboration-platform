import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Comments from "./Comments";
import Attachments from "./Attachments";
function TaskCard({ t, updateStatus }) {
  return (
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-xl transition"
    >
      <h4 className="font-semibold mb-2">{t.title}</h4>

      {/* Priority Badge */}
      <span className={`px-2 py-1 text-xs rounded
        ${t.priority === "high" && "bg-red-500 text-white"}
        ${t.priority === "medium" && "bg-yellow-400"}
        ${t.priority === "low" && "bg-green-400"}
      `}>
        {t.priority}
      </span>

      {/* Status Icons */}
      <div className="flex gap-2 mt-2">
        <CheckCircle className="text-green-500" size={16} />
        <Clock className="text-yellow-500" size={16} />
        <AlertTriangle className="text-red-500" size={16} />
      </div>
      {/* Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => updateStatus(t.id, "in progress")}
          className="bg-yellow-400 px-2 py-1 rounded"
        >
          Start
        </button>

        <button
          onClick={() => updateStatus(t.id, "done")}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Done
        </button>
      </div>
      <div className="mt-3">

  <Comments taskId={t.id} />

  <Attachments taskId={t.id} />

</div>
    </motion.div>
    
  );
}

export default TaskCard;