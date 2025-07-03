import React, { useState, useEffect } from "react";

export default function TaskEditModal({ open, onClose, task, onSave }) {
  const [status, setStatus] = useState(task?.status || "todo");

  useEffect(() => {
    setStatus(task?.status || "todo");
  }, [task]);

  if (!open || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(task._id, status);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
        <h2 className="text-lg font-bold mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={task.title}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              value={task.description}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
