import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('[API Response Error]', error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// File Management API methods
export const fileAPI = {
    createFile: (projectId, branch, filePath, content = '') =>
        api.post(`/projects/${projectId}/files/${branch}/create`, { filePath, content }),

    deleteFile: (projectId, branch, filePath) =>
        api.delete(`/projects/${projectId}/files/${branch}/${filePath}`),

    renameFile: (projectId, branch, oldPath, newPath) =>
        api.put(`/projects/${projectId}/files/${branch}/rename`, { oldPath, newPath }),

    createDirectory: (projectId, branch, dirPath) =>
        api.post(`/projects/${projectId}/directories/${branch}/create`, { dirPath })
};

export default api;

