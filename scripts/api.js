// API Handler with LocalStorage Fallback
const API = {
  baseURL: "https://reqres.in/api",
  localKey: "userTasks",
  userId: "user123", // mock user ID

  async getTasks() {
    try {
      // Load from localStorage
      const localTasks = JSON.parse(localStorage.getItem(this.localKey)) || [];
      return localTasks.filter(task => task.userId === this.userId);
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  },

  async createTask(task) {
    try {
      // Save locally
      const currentTasks = JSON.parse(localStorage.getItem(this.localKey)) || [];
      currentTasks.push(task);
      localStorage.setItem(this.localKey, JSON.stringify(currentTasks));

      // Simulate sending to server
      const r = await fetch(`${this.baseURL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!r.ok) throw new Error(`POST failed: ${r.status}`);
      return r.json();
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async deleteAllTasks() {
    try {
      // Clear localStorage
      localStorage.removeItem(this.localKey);
      return true;
    } catch (error) {
      console.error("Error deleting tasks:", error);
      return false;
    }
  },
};

export default API;
