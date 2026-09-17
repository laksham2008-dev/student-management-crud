const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const getUrl = (resource, path = '') => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const pathText = String(path);
  if (pathText.startsWith('?')) return `${base}/${resource}/${pathText}`;
  const suffix = path ? `/${pathText.replace(/^\//, '').replace(/\/$/, '')}` : '';
  return `${base}/${resource}${suffix}/`;
};

const handleResponse = async (response) => {
  if (response.status === 204) return { success: true };
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('student_management_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/setup') window.location.assign('/login');
    }
    const error = new Error(data?.message || data?.detail || data?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const request = async (resource, path, options = {}) => {
  const token = localStorage.getItem('student_management_token');
  const response = await fetch(getUrl(resource, path), {
    ...options,
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  return handleResponse(response);
};

export const studentApi = {
  async getAllStudents(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const result = await request('students', query);
    return Array.isArray(result) ? result : result.data || [];
  },
  async createStudent(data) { return request('students', '', { method: 'POST', body: JSON.stringify(data) }); },
  async getStudent(id) { const result = await request('students', id); return result.data || result; },
  async updateStudent(id, data) { return request('students', id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteStudent(id) { return request('students', id, { method: 'DELETE' }); },
};

export const departmentApi = {
  async getAll() { const result = await request('departments'); return result.data || []; },
  async create(name, code = '') { return request('departments', '', { method: 'POST', body: JSON.stringify({ name, code }) }); },
  async delete(id) { return request('departments', id, { method: 'DELETE' }); },
  async update(id, data) { return request('departments', id, { method: 'PUT', body: JSON.stringify(data) }); },
};

export const settingsApi = {
  async get() { return request('settings'); },
  async save(college_name) { return request('settings', '', { method: 'POST', body: JSON.stringify({ college_name }) }); },
  async update(college_name, admin_email) { return request('settings', '', { method: 'PATCH', body: JSON.stringify({ college_name, admin_email }) }); },
};

export const authApi = {
  async status() { return request('setup'); },
  async setup(data) { return request('setup', '', { method: 'POST', body: JSON.stringify(data) }); },
  async login(data) { return request('login', '', { method: 'POST', body: JSON.stringify(data) }); },
  async logout() { return request('logout', '', { method: 'POST' }); },
};

export const accessApi = {
  async getAll() { const result = await request('users'); return result.data || []; },
  async create(email, password) { return request('users', '', { method: 'POST', body: JSON.stringify({ email, password }) }); },
  async update(id, data) { return request('users', id, { method: 'PATCH', body: JSON.stringify(data) }); },
};

export default studentApi;
