import { auth, googleProvider, signInWithPopup } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorDiv = document.getElementById('auth-error');

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    async function handleGoogleLogin() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Extract info from Firebase user
            const nameParts = (user.displayName || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Send to our Django backend to get a JWT
            const response = await api.request('/auth/google/', 'POST', {
                email: user.email,
                first_name: firstName,
                last_name: lastName
            }, false);
            
            // Save Django tokens
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
            
            // Fetch the user object from Django and redirect
            const djangoUser = await api.getCurrentUser();
            if (djangoUser) {
                redirectBasedOnRole(djangoUser.role);
            }
            
        } catch (error) {
            console.error("Firebase Login Error:", error);
            showError(error.message || 'Google Login failed.');
        }
    }

    // Attach Google Login handlers
    const loginGoogleBtn = document.getElementById('login-google-btn');
    if (loginGoogleBtn) loginGoogleBtn.addEventListener('click', handleGoogleLogin);
    
    const regGoogleBtn = document.getElementById('reg-google-btn');
    if (regGoogleBtn) regGoogleBtn.addEventListener('click', handleGoogleLogin);

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const user = await api.login(email, password);
                if (user) {
                    redirectBasedOnRole(user.role);
                }
            } catch (error) {
                showError('Invalid email or password.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;
            
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            try {
                const user = await api.register({
                    username: email,
                    email: email,
                    password: password,
                    first_name: firstName,
                    last_name: lastName,
                    role: role
                });
                if (user) {
                    redirectBasedOnRole(user.role);
                }
            } catch (error) {
                let msg = 'Registration failed. ';
                if (error.data) {
                    msg += Object.values(error.data).flat().join(' ');
                }
                showError(msg);
            }
        });
    }
});

function redirectBasedOnRole(role) {
    if (role === 'owner') {
        window.location.href = 'dashboard_owner.html';
    } else if (role === 'admin') {
        window.location.href = 'dashboard_admin.html';
    } else {
        window.location.href = 'dashboard_tenant.html';
    }
}
