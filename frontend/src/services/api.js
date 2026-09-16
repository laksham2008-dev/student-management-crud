/**
 * Centralized API service for communicating with the Django REST Framework backend.
 * Base URL is configurable via VITE_API_BASE_URL environment variable.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/students/';

// Helper to ensure trailing slash
const getUrl = (path = '') => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path.slice(1) : path}${path.endsWith('/') ? '' : '/'}`;
};

/**
 * Parses and standardizes API error responses.
 */
const handleResponse = async (response) => {
  if (response.status === 204) {
    return { success: true };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error();
    error.status = response.status;
    error.data = data;
    
    // Extract a clear human-readable message
    if (data && typeof data === 'object') {
      if (data.details) {
        if (typeof data.details === 'object' && !Array.isArray(data.details)) {
          const firstKey = Object.keys(data.details)[0];
          const firstVal = data.details[firstKey];
          error.message = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
        } else {
          error.message = String(data.details);
        }
      } else if (data.detail) {
        error.message = data.detail;
      } else if (data.error) {
        error.message = data.error;
      } else {
        error.message = `Request failed with status ${response.status}`;
      }
    } else {
      error.message = `Server returned status ${response.status}`;
    }
    throw error;
  }

  return data;
};

export const studentApi = {
  /**
   * Fetch all students (with optional backend search query)
   */
  async getAllStudents(search = '') {
    const url = search ? `${getUrl()}?search=${encodeURIComponent(search)}` : getUrl();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const result = await handleResponse(response);
    // DRF list view returns array directly or inside data key
    return Array.isArray(result) ? result : (result.data || []);
  },

  /**
   * Fetch a single student by ID
   */
  async getStudentById(id) {
    const response = await fetch(getUrl(`${id}/`), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Create a new student record
   */
  async createStudent(studentData) {
    const response = await fetch(getUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return await handleResponse(response);
  },

  /**
   * Update an existing student record (PUT)
   */
  async updateStudent(id, studentData) {
    const response = await fetch(getUrl(`${id}/`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return await handleResponse(response);
  },

  /**
   * Partially update a student record (PATCH)
   */
  async patchStudent(id, partialData) {
    const response = await fetch(getUrl(`${id}/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(partialData),
    });
    return await handleResponse(response);
  },

  /**
   * Delete a student record by ID
   */
  async deleteStudent(id) {
    const response = await fetch(getUrl(`${id}/`), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return await handleResponse(response);
  },
};

export default studentApi;
