import { API_BASE_URL } from './config.js';

const getHeaders = () => {
    const token = localStorage.getItem('layzur_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    async register(username, password) {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    async uploadImage(formData) {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('layzur_token')}`
            },
            body: formData
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    },

    async createPost(username, content, media = null) {
        const response = await fetch(`${API_BASE_URL}/api/post`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ username, content, media })
        });
        if (!response.ok) throw new Error('Post creation failed');
        return response.json();
    },

    async getPosts() {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        return response.json();
    },

    async likePost(username, post_id) {
        const response = await fetch(`${API_BASE_URL}/api/like`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ username, post_id })
        });
        if (!response.ok) throw new Error('Like failed');
        return response.json();
    },

    async followUser(follower, following) {
        const response = await fetch(`${API_BASE_URL}/api/follow`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ follower, following })
        });
        if (!response.ok) throw new Error('Follow failed');
        return response.json();
    },

    async getFollowerCount(username) {
        const response = await fetch(`${API_BASE_URL}/api/followers/${username}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch followers');
        return response.json();
    }
};
