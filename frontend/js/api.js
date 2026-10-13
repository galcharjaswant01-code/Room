const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
    static getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (includeAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    static async request(endpoint, method = 'GET', data = null, includeAuth = true) {
        const config = {
            method,
            headers: this.getHeaders(includeAuth)
        };
        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401 && includeAuth) {
                // Token might be expired, try to refresh
                const success = await this.refreshToken();
                if (success) {
                    // Retry with new token
                    config.headers = this.getHeaders(true);
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
                    return await this.handleResponse(retryResponse);
                } else {
                    // Refresh failed, logout
                    this.logout();
                    throw new Error('Authentication required');
                }
            }
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    static async handleResponse(response) {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.detail || data.error || 'API Error');
            error.data = data;
            error.status = response.status;
            throw error;
        }
        return data;
    }

    static async login(username, password) {
        const data = await this.request('/auth/login/', 'POST', { username, password }, false);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        return await this.getCurrentUser();
    }

    static async register(userData) {
        await this.request('/auth/register/', 'POST', userData, false);
        return await this.login(userData.username, userData.password);
    }

    static async getCurrentUser() {
        if (!localStorage.getItem('access_token')) return null;
        try {
            const user = await this.request('/auth/me/');
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (e) {
            return null;
        }
    }

    static async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const data = await this.request('/auth/token/refresh/', 'POST', { refresh }, false);
            localStorage.setItem('access_token', data.access);
            return true;
        } catch (e) {
            return false;
        }
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/index.html'; // Adjust path based on current location
    }

    // Properties
    static getRooms(filters = '') { return this.request(`/properties/rooms/${filters ? '?' + filters : ''}`, 'GET', null, false); }
    static getRoom(id) { return this.request(`/properties/rooms/${id}/`, 'GET', null, false); }
    
    // Bookings
    static createBooking(data) { return this.request('/bookings/', 'POST', data); }
    static processPayment(bookingId, data) { return this.request(`/bookings/${bookingId}/process_payment/`, 'POST', data); }
}

window.api = ApiService;

// Update UI based on auth state
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    const navActions = document.querySelector('.nav-actions');
    
    if (userStr && navActions) {
        const user = JSON.parse(userStr);
        let dashboardLink = 'pages/dashboard_tenant.html';
        if (user.role === 'owner') dashboardLink = 'pages/dashboard_owner.html';
        if (user.role === 'admin') dashboardLink = 'pages/dashboard_admin.html';
        
        // Fix path for nested pages
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
        const prefix = isIndex ? '' : '../';
        
        navActions.innerHTML = `
            <span class="user-greeting">Hi, ${user.first_name || user.username}</span>
            <a href="${prefix}${dashboardLink}" class="btn btn-outline">Dashboard</a>
            <button onclick="api.logout()" class="btn btn-text">Logout</button>
        `;
    }
});
