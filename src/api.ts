const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Auth
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return res.json();
    },
    getUsers: async () => {
      const res = await fetch(`${API_BASE}/auth/users`);
      return res.json();
    },
    createUser: async (username: string, password: string, email: string) => {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });
      return res.json();
    },
    deleteUser: async (username: string) => {
      const res = await fetch(`${API_BASE}/auth/users/${username}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    updatePassword: async (username: string, newPassword: string) => {
      const res = await fetch(`${API_BASE}/auth/users/${username}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      return res.json();
    }
  },

  // Players
  players: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/players`);
      return res.json();
    },
    create: async (player: any) => {
      const res = await fetch(`${API_BASE}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player)
      });
      return res.json();
    },
    update: async (id: number, player: any) => {
      const res = await fetch(`${API_BASE}/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player)
      });
      return res.json();
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/players/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },

  // Trainings
  trainings: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/trainings`);
      return res.json();
    },
    create: async (training: any) => {
      const res = await fetch(`${API_BASE}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(training)
      });
      return res.json();
    },
    update: async (id: number, training: any) => {
      const res = await fetch(`${API_BASE}/trainings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(training)
      });
      return res.json();
    }
  },

  // Matches
  matches: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/matches`);
      return res.json();
    },
    create: async (match: any) => {
      const res = await fetch(`${API_BASE}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match)
      });
      return res.json();
    },
    update: async (id: number, match: any) => {
      const res = await fetch(`${API_BASE}/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match)
      });
      return res.json();
    }
  },

  // Callups
  callups: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/callups`);
      return res.json();
    },
    create: async (callup: any) => {
      const res = await fetch(`${API_BASE}/callups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callup)
      });
      return res.json();
    },
    update: async (id: number, callup: any) => {
      const res = await fetch(`${API_BASE}/callups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callup)
      });
      return res.json();
    }
  },

  // Formations
  formations: {
    getLatest: async () => {
      const res = await fetch(`${API_BASE}/formations/latest`);
      return res.json();
    },
    create: async (formation: any) => {
      const res = await fetch(`${API_BASE}/formations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formation)
      });
      return res.json();
    },
    update: async (id: number, formation: any) => {
      const res = await fetch(`${API_BASE}/formations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formation)
      });
      return res.json();
    }
  },

  // Settings
  settings: {
    get: async () => {
      const res = await fetch(`${API_BASE}/settings`);
      return res.json();
    },
    update: async (settings: any) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return res.json();
    }
  }
};
