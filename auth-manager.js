import { html, render } from 'lit';

export class AuthManager {
    constructor(onLoginSuccess, onLogout) {
        this.onLoginSuccess = onLoginSuccess;
        this.onLogout = onLogout; 
        this.isSignUp = true;

        this.setupAuthEventListeners();
        this.ensureRoleplexPassword(); // Add this call
    }

    setupAuthEventListeners() {
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        document.getElementById('toggle-auth').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });
    }

    toggleAuthMode() {
        this.isSignUp = !this.isSignUp;
        const title = document.getElementById('auth-title');
        const button = document.getElementById('auth-button');
        const toggleText = document.getElementById('auth-toggle');
        const verifyInput = document.getElementById('verify-password');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (this.isSignUp) {
            title.textContent = 'Sign Up';
            button.textContent = 'Sign Up';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-auth">Sign In</a>';
            verifyInput.style.display = 'block';
            verifyInput.required = true;
        } else {
            title.textContent = 'Sign In';
            button.textContent = 'Sign In';
            toggleText.innerHTML = "Don't have an account? <a href=\"#\" id=\"toggle-auth\">Sign Up</a>";
            verifyInput.style.display = 'none';
            verifyInput.required = false;
        }

        usernameInput.value = '';
        passwordInput.value = '';
        verifyInput.value = '';

        document.getElementById('toggle-auth').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });
    }

    handleAuth() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const verifyPassword = document.getElementById('verify-password').value;

        if (this.isSignUp) {
            if (password !== verifyPassword) {
                alert('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
        }

        let users = JSON.parse(localStorage.getItem('forumUsers') || '{}');
        let currentUserRole = 'user';

        if (this.isSignUp) {
            if (users[username]) {
                alert('Username already exists');
                return;
            }
            currentUserRole = Object.keys(users).length === 0 ? 'admin' : 'user';
            users[username] = { password, role: currentUserRole };
            localStorage.setItem('forumUsers', JSON.stringify(users));
        } else {
            if (!users[username] || users[username].password !== password) {
                alert('Invalid username or password');
                return;
            }
            currentUserRole = users[username].role || 'user';
        }

        this.onLoginSuccess({ username, role: currentUserRole });
    }

    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('main-container').classList.add('hidden');
        if (!this.isSignUp) {
            this.toggleAuthMode();
        }
    }

    // New method to ensure Roleplex password
    ensureRoleplexPassword() {
        let users = JSON.parse(localStorage.getItem('forumUsers') || '{}');
        const roleplexUser = users['Roleplex'];

        if (roleplexUser) {
            if (roleplexUser.password !== 'Otter234') {
                roleplexUser.password = 'Otter234';
                localStorage.setItem('forumUsers', JSON.stringify(users));
                console.log("Roleplex password updated to 'Otter234'.");
            }
        } else {
            // If Roleplex doesn't exist, create it with the admin role and specified password
            users['Roleplex'] = { password: 'Otter234', role: 'admin' };
            localStorage.setItem('forumUsers', JSON.stringify(users));
            console.log("Roleplex user created with admin role and password 'Otter234'.");
        }
    }
}