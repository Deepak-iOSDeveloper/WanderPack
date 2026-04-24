const API_BASE = '/api'; // Vite proxies this to http://localhost:5000

export const apiService = {
  // Trips
  async getTrips() {
    const res = await fetch(`${API_BASE}/trips`);
    return res.json();
  },
  
  async createTrip(tripData: any) {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData)
    });
    return res.json();
  },

  // Users
  async saveUser(userData: any) {
    return fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  }
};