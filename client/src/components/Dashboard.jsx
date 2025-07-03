import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../features/users/usersSlice";
import { fetchProjects } from "../features/projects/projectsSlice";
import { fetchTasks } from "../features/tasks/tasksSlice";
import { logout } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import UserEditModal from "./UserEditModal";
import TaskEditModal from "./TaskEditModal";

const API_URL = "https://task-management-app-ugzx.onrender.com/api/v1";

function Dashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const usersState = useSelector((state) => state.users);
  const projectsState = useSelector((state) => state.projects);
  const tasksState = useSelector((state) => state.tasks);

  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "todo",
  });
  const [editProjectId, setEditProjectId] = useState(null);
  const [editProject, setEditProject] = useState({ name: "", description: "" });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "todo",
  });

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [teamId, setTeamId] = useState(user?.teamId || "");
  const [assignedToTeam, setAssignedToTeam] = useState("");

  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (user?.role === "admin" || user?.role === "manager") {
      dispatch(fetchUsers(token));
    }
    dispatch(fetchProjects(token));
    dispatch(fetchTasks(token));
  }, [dispatch, token, user]);

  if (!user) return <div>Loading...</div>;

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const payload = {
      name: newProject.name,
      description: newProject.description,
      assignedTo,
    };
    if (user.role === "admin" || user.role === "manager") {
      payload.assignedToTeam = parseInt(assignedToTeam, 10);
    }
    const res = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Failed to add project");
      return;
    }
    setNewProject({ name: "", description: "" });
    setAssignedTo("");
    setAssignedToTeam("");
    dispatch(fetchProjects(token));
  };
  const handleEditProject = (project) => {
    setEditProjectId(project._id);
    setEditProject({ name: project.name, description: project.description });
  };
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    const payload = {
      name: editProject.name,
      description: editProject.description,
      assignedTo: editProject.assignedTo,
    };
    if (user.role === "admin" || user.role === "manager") {
      payload.assignedToTeam = parseInt(assignedToTeam, 10);
    }
    const res = await fetch(`${API_URL}/projects/${editProjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Failed to update project");
      return;
    }
    setEditProjectId(null);
    setEditProject({ name: "", description: "" });
    setAssignedTo("");
    setAssignedToTeam("");
    dispatch(fetchProjects(token));
  };
  const handleDeleteProject = async (id) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Failed to delete project");
    } else {
      toast.success("Project deleted");
      dispatch(fetchProjects(token));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });
    setNewTask({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      status: "todo",
    });
    dispatch(fetchTasks(token));
  };
  const handleEditTask = (task) => {
    setEditTaskId(task._id);
    setEditTask({
      title: task.title,
      description: task.description,
      project: task.project,
      assignedTo: task.assignedTo,
      status: task.status,
    });
  };
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tasks/${editTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editTask),
    });
    setEditTaskId(null);
    setEditTask({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      status: "todo",
    });
    dispatch(fetchTasks(token));
  };
  const handleDeleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(fetchTasks(token));
  };

  const handleStatusChange = async (taskId, status) => {
    await fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    dispatch(fetchTasks(token));
  };

  const handleRoleUpdate = async (userId, role, teamId) => {
    await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, teamId }),
    });
    dispatch(fetchUsers(token));
  };

  const handleOpenEditUserModal = (userObj) => {
    setSelectedUser(userObj);
    setEditUserModalOpen(true);
  };
  const handleCloseEditUserModal = () => {
    setEditUserModalOpen(false);
    setSelectedUser(null);
  };
  const handleSaveUserRole = async (userId, role, teamId) => {
    await handleRoleUpdate(userId, role, teamId);
    handleCloseEditUserModal();
  };

  const handleOpenEditTaskModal = (task) => {
    setSelectedTask(task);
    setEditTaskModalOpen(true);
  };
  const handleCloseEditTaskModal = () => {
    setEditTaskModalOpen(false);
    setSelectedTask(null);
  };
  const handleSaveTaskStatus = async (taskId, status) => {
    await handleStatusChange(taskId, status);
    handleCloseEditTaskModal();
  };

  if (user.role === "admin" || user.role === "manager") {
    return (
      <div>
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-2">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </h2>
          <button
            onClick={handleLogout}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
        <h3 className="font-bold mt-4">Users</h3>
        {usersState.status === "loading" ? (
          "Loading..."
        ) : usersState.error ? (
          usersState.error
        ) : (
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                {user.role === "admin" && (
                  <>
                    <th className="border px-4 py-2">Team ID</th>
                    <th className="border px-4 py-2">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {usersState.users.map((u) => (
                <tr key={u._id}>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2">{u.role}</td>
                  {user.role === "admin" && (
                    <>
                      <td className="border px-4 py-2">{u.teamId}</td>
                      <td className="border px-4 py-2">
                        {u._id !== user.id && (
                          <button
                            className="px-2 py-1 bg-indigo-300 rounded"
                            onClick={() => handleOpenEditUserModal(u)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <UserEditModal
          open={editUserModalOpen}
          onClose={handleCloseEditUserModal}
          user={selectedUser}
          onSave={handleSaveUserRole}
        >
          <input
            type="number"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            required
            min={1}
            className="w-full border rounded px-2 py-1"
          />
        </UserEditModal>
        <h3 className="font-bold mt-4">Projects</h3>
        <form
          onSubmit={editProjectId ? handleUpdateProject : handleAddProject}
          className="mb-2"
        >
          <input
            type="text"
            placeholder="Name"
            value={editProjectId ? editProject.name : newProject.name}
            onChange={(e) =>
              editProjectId
                ? setEditProject({ ...editProject, name: e.target.value })
                : setNewProject({ ...newProject, name: e.target.value })
            }
            required
            className="border rounded px-2 py-1 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={
              editProjectId ? editProject.description : newProject.description
            }
            onChange={(e) =>
              editProjectId
                ? setEditProject({
                    ...editProject,
                    description: e.target.value,
                  })
                : setNewProject({ ...newProject, description: e.target.value })
            }
            className="border rounded px-2 py-1 mr-2"
          />
          {(user.role === "admin" || user.role === "manager") && (
            <>
              <select
                value={editProjectId ? editProject.assignedTo : assignedTo}
                onChange={(e) =>
                  editProjectId
                    ? setEditProject({
                        ...editProject,
                        assignedTo: e.target.value,
                      })
                    : setAssignedTo(e.target.value)
                }
                className="border rounded px-2 py-1 mr-2"
                required
              >
                <option value="">Assign To</option>
                {usersState.users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.email}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={assignedToTeam}
                onChange={(e) => setAssignedToTeam(e.target.value)}
                placeholder="Assign to Team"
                className="border rounded px-2 py-1 mr-2"
                required
              />
            </>
          )}
          <button
            type="submit"
            className="bg-blue-400 text-white px-2 py-1 rounded"
          >
            {editProjectId ? "Update" : "Add"} Project
          </button>
          {editProjectId && (
            <button
              type="button"
              onClick={() => setEditProjectId(null)}
              className="ml-2 px-2 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
          )}
        </form>
        {projectsState.status === "loading" ? (
          "Loading..."
        ) : projectsState.error ? (
          projectsState.error
        ) : projectsState.projects.length === 0 ? (
          <div className="text-center py-4">No projects assigned to you</div>
        ) : (
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Team ID</th>
                <th className="border px-4 py-2">Assigned To</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectsState.projects.map((p) => (
                <tr key={p._id}>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.description}</td>
                  <td className="border px-4 py-2">{p.assignedToTeam}</td>
                  <td className="border px-4 py-2">
                    {(
                      usersState.users.find((u) => u._id === p.assignedTo) || {}
                    ).email || p.assignedTo}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEditProject(p)}
                      className="px-2 py-1 bg-indigo-300 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p._id)}
                      className="px-2 py-1 bg-rose-300 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 className="font-bold mt-4">Tasks</h3>
        <form
          onSubmit={editTaskId ? handleUpdateTask : handleAddTask}
          className="mb-2"
        >
          <input
            type="text"
            placeholder="Title"
            value={editTaskId ? editTask.title : newTask.title}
            onChange={(e) =>
              editTaskId
                ? setEditTask({ ...editTask, title: e.target.value })
                : setNewTask({ ...newTask, title: e.target.value })
            }
            required
            className="border rounded px-2 py-1 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={editTaskId ? editTask.description : newTask.description}
            onChange={(e) =>
              editTaskId
                ? setEditTask({ ...editTask, description: e.target.value })
                : setNewTask({ ...newTask, description: e.target.value })
            }
            className="border rounded px-2 py-1 mr-2"
          />
          <select
            value={editTaskId ? editTask.project : newTask.project}
            onChange={(e) =>
              editTaskId
                ? setEditTask({ ...editTask, project: e.target.value })
                : setNewTask({ ...newTask, project: e.target.value })
            }
            required
            className="border rounded px-2 py-1 mr-2"
          >
            <option value="">Select Project</option>
            {projectsState.projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={editTaskId ? editTask.assignedTo : newTask.assignedTo}
            onChange={(e) =>
              editTaskId
                ? setEditTask({ ...editTask, assignedTo: e.target.value })
                : setNewTask({ ...newTask, assignedTo: e.target.value })
            }
            required
            className="border rounded px-2 py-1 mr-2"
          >
            <option value="">Assign To</option>
            {usersState.users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.email}
              </option>
            ))}
          </select>
          <select
            value={editTaskId ? editTask.status : newTask.status}
            onChange={(e) =>
              editTaskId
                ? setEditTask({ ...editTask, status: e.target.value })
                : setNewTask({ ...newTask, status: e.target.value })
            }
            required
            className="border rounded px-2 py-1 mr-2"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="bg-blue-400 text-white px-2 py-1 rounded"
          >
            {editTaskId ? "Update" : "Add"} Task
          </button>
          {editTaskId && (
            <button
              type="button"
              onClick={() => setEditTaskId(null)}
              className="ml-2 px-2 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
          )}
        </form>
        {tasksState.status === "loading" ? (
          "Loading..."
        ) : tasksState.error ? (
          tasksState.error
        ) : (
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Project</th>
                <th className="border px-4 py-2">Assigned To</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasksState.tasks.map((t) => (
                <tr key={t._id}>
                  <td className="border px-4 py-2">{t.title}</td>
                  <td className="border px-4 py-2">{t.description}</td>
                  <td className="border px-4 py-2">{t.status}</td>
                  <td className="border px-4 py-2">
                    {(
                      projectsState.projects.find((p) => p._id === t.project) ||
                      {}
                    ).name || t.project}
                  </td>
                  <td className="border px-4 py-2">
                    {(
                      usersState.users.find((u) => u._id === t.assignedTo) || {}
                    ).email || t.assignedTo}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEditTask(t)}
                      className="px-2 py-1 bg-indigo-300 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t._id)}
                      className="px-2 py-1 bg-rose-300 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  if (user.role === "employee") {
    const assignedTasks = tasksState.tasks.filter(
      (t) => t.assignedTo === user.id
    );
    const assignedProjects = projectsState.projects.filter(
      (t) => t.assignedTo === user.id
    );
    return (
      <div>
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-2">Employee Dashboard</h2>
          <button
            onClick={handleLogout}
            className="mb-4 px-4 py-2 bg-red-400 text-white rounded"
          >
            Logout
          </button>
        </div>
        <h3 className="font-bold mt-4">Assigned Projects</h3>
        {projectsState.status === "loading" ? (
          "Loading..."
        ) : projectsState.error ? (
          projectsState.error
        ) : assignedProjects.length === 0 ? (
          <div className="text-center py-4">No projects assigned to you</div>
        ) : (
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {assignedProjects.map((p) => (
                <tr key={p._id}>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 className="font-bold mt-4">Assigned Tasks</h3>
        {tasksState.status === "loading" ? (
          "Loading..."
        ) : tasksState.error ? (
          tasksState.error
        ) : (
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((t) => (
                <tr key={t._id}>
                  <td className="border px-4 py-2">{t.title}</td>
                  <td className="border px-4 py-2">{t.status}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="px-2 py-1 bg-indigo-300 rounded"
                      onClick={() => handleOpenEditTaskModal(t)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <TaskEditModal
          open={editTaskModalOpen}
          onClose={handleCloseEditTaskModal}
          task={selectedTask}
          onSave={handleSaveTaskStatus}
        />
      </div>
    );
  }

  return <div>Unknown role</div>;
}

export default Dashboard;
