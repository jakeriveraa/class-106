// Fixed API to get connected
const API = {
  baseURL: "https://reqres.in/api",
  
  async getTask() {
    try {
      const r = await fetch(`${this.baseURL}/users?page=2`);
      if (!r.ok) throw new Error(`GET failed: ${r.status}`);
      const data = await r.json();

      return data.data.map((u) => ({
        title: `${u.first_name} ${u.last_name}`, // Fixed property access
        description: u.email,
        color: "#AB2311",
        startDate: new Date().toISOString().slice(0, 16), // Fixed slice parameters
        status: "New",
        budget: Math.floor(Math.random() * 5000) + 1000, // Random budget for demo
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  async createTask(task) { // Fixed typo in method name
    try {
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
};

export default API;