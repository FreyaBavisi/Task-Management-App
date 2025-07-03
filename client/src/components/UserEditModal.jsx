import React, { useState, useEffect } from "react";

export default function UserEditModal({ open, onClose, user, onSave }) {
  const [role, setRole] = useState(user?.role || "employee");
  const [teamId, setTeamId] = useState(user?.teamId || "");

  useEffect(() => {
    setRole(user?.role || "employee");
    setTeamId(user?.teamId || "");
  }, [user]);

  if (!open || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, role, parseInt(teamId, 10));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
        <h2 className="text-lg font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">User ID</label>
            <input
              type="text"
              value={user._id}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Team ID</label>
            <input
              type="number"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
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
