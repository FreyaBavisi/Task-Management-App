const API_URL = "https://task-management-app-ugzx.onrender.com/api/v1/users";

const AuthService = {
  async login({ email, password }) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Login failed");
    return await res.json();
  },
  async signup({ email, password, role }) {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Signup failed");
    return await res.json();
  },
};

export default AuthService;
