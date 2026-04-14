const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  register: async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  // Clients
  getClients: async () => {
    const res = await fetch(`${API_URL}/clients`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  getClient: async (id: string) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  createClient: async (data: any) => {
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  updateClient: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  getWorkoutChart: async (clientId: string, plan: string, period: string) => {
    const res = await fetch(`${API_URL}/clients/${clientId}/workout-chart`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan, period })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  deleteClient: async (id: string) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  // Trainers
  getTrainers: async () => {
    const res = await fetch(`${API_URL}/trainers`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  createTrainer: async (data: any) => {
    const res = await fetch(`${API_URL}/trainers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  updateTrainer: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/trainers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  deleteTrainer: async (id: string) => {
    const res = await fetch(`${API_URL}/trainers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  chatbot: async (message: string) => {
    const res = await fetch(`${API_URL}/chatbot`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};
