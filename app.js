import { html, render } from 'lit';

class ForumApp {
    constructor() {
        this.room = null;
        this.currentUser = null;
        this.activeGroup = 'general';
        this.groups = new Set(['general']);
        this.isSignUp = true;
        this.currentImageUrl = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('forumUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
            this.connectToRoom();
        } else {
            this.showAuth();
        }
    }

    setupEventListeners() {
        // Auth form
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        // Toggle auth mode
        document.getElementById('toggle-auth').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Create group
        document.getElementById('create-group-btn').addEventListener('click', () => {
            this.createGroup();
        });

        // Post
        document.getElementById('post-btn').addEventListener('click', () => {
            this.createPost();
        });

        // Image upload
        document.getElementById('upload-image-btn').addEventListener('click', () => {
            document.getElementById('post-image').click();
        });

        document.getElementById('post-image').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
    }

    async connectToRoom() {
        this.room = new WebsimSocket();
        await this.room.initialize();

        // Initialize room state if empty
        if (!this.room.roomState.groups) {
            this.room.updateRoomState({
                groups: {
                    general: {
                        name: 'General',
                        description: 'Default group for all users',
                        members: {}
                    }
                }
            });
        }

        if (!this.room.roomState.posts) {
            this.room.updateRoomState({
                posts: {}
            });
        }

        // Add user to general group if not already a member
        if (!this.room.roomState.groups.general.members[this.currentUser.username]) {
            this.room.updateRoomState({
                groups: {
                    general: {
                        ...this.room.roomState.groups.general,
                        members: {
                            ...this.room.roomState.groups.general.members,
                            [this.currentUser.username]: true
                        }
                    }
                }
            });
        }

        // Subscribe to updates
        this.room.subscribeRoomState(() => {
            this.updateGroupsList();
            this.updatePostsList();
        });

        this.room.subscribePresence(() => {
            this.updateOnlineUsers();
        });

        // Set user presence
        this.room.updatePresence({
            username: this.currentUser.username,
            activeGroup: this.activeGroup,
            lastSeen: Date.now()
        });
    }

    toggleAuthMode() {
        this.isSignUp = !this.isSignUp;
        const title = document.getElementById('auth-title');
        const button = document.getElementById('auth-button');
        const toggleText = document.getElementById('auth-toggle');
        const verifyInput = document.getElementById('verify-password');

        if (this.isSignUp) {
            title.textContent = 'Sign Up';
            button.textContent = 'Sign Up';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-auth">Sign In</a>';
            verifyInput.style.display = 'block';
            verifyInput.required = true;
        } else {
            title.textContent = 'Sign In';
            button.textContent = 'Sign In';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-auth">Sign Up</a>';
            verifyInput.style.display = 'none';
            verifyInput.required = false;
        }

        // Re-attach event listener
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
                this.showError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                this.showError('Password must be at least 6 characters');
                return;
            }
        }

        // For this demo, we'll use localStorage for auth
        if (this.isSignUp) {
            // Check if user exists
            const users = JSON.parse(localStorage.getItem('forumUsers') || '{}');
            if (users[username]) {
                this.showError('Username already exists');
                return;
            }
            users[username] = { password };
            localStorage.setItem('forumUsers', JSON.stringify(users));
        } else {
            // Sign in
            const users = JSON.parse(localStorage.getItem('forumUsers') || '{}');
            if (!users[username] || users[username].password !== password) {
                this.showError('Invalid username or password');
                return;
            }
        }

        // Save current user
        this.currentUser = { username, password };
        localStorage.setItem('forumUser', JSON.stringify(this.currentUser));

        this.showMainApp();
        this.connectToRoom();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.getElementById('auth-form');
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        form.appendChild(errorDiv);
    }

    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('main-container').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        document.getElementById('current-user').textContent = this.currentUser.username;
    }

    createGroup() {
        const groupName = document.getElementById('new-group-name').value.trim();
        if (!groupName) return;

        const groupId = groupName.toLowerCase().replace(/\s+/g, '-');
        
        if (this.room.roomState.groups[groupId]) {
            alert('Group already exists!');
            return;
        }

        this.room.updateRoomState({
            groups: {
                ...this.room.roomState.groups,
                [groupId]: {
                    name: groupName,
                    description: `Created by ${this.currentUser.username}`,
                    members: {
                        [this.currentUser.username]: true
                    }
                }
            }
        });

        document.getElementById('new-group-name').value = '';
    }

    switchGroup(groupId) {
        this.activeGroup = groupId;
        this.room.updatePresence({
            ...this.room.presence[this.room.clientId],
            activeGroup: groupId
        });
        this.updateGroupsList();
        this.updatePostsList();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const url = await websim.upload(file);
            this.currentImageUrl = url;
            
            const preview = document.getElementById('image-preview');
            render(html`
                <img src="${url}" alt="Preview">
                <button type="button" @click=${() => this.removeImage()}>Remove</button>
            `, preview);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        }
    }

    removeImage() {
        this.currentImageUrl = null;
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('post-image').value = '';
    }

    createPost() {
        const content = document.getElementById('post-content').value.trim();
        if (!content && !this.currentImageUrl) return;

        const postId = Date.now().toString();
        const post = {
            id: postId,
            content,
            author: this.currentUser.username,
            group: this.activeGroup,
            timestamp: Date.now(),
            imageUrl: this.currentImageUrl || null
        };

        this.room.updateRoomState({
            posts: {
                ...this.room.roomState.posts,
                [postId]: post
            }
        });

        document.getElementById('post-content').value = '';
        this.removeImage();
    }

    updateGroupsList() {
        const groupsList = document.getElementById('groups-list');
        const groups = this.room.roomState.groups || {};

        render(html`
            ${Object.entries(groups).map(([groupId, group]) => {
                const isMember = group.members[this.currentUser.username];
                const memberCount = Object.keys(group.members).length;
                
                return html`
                    <div class="group-item ${groupId === this.activeGroup ? 'active' : ''}"
                         @click=${() => isMember ? this.switchGroup(groupId) : this.joinGroup(groupId)}>
                        <div class="group-name">${group.name}</div>
                        <div class="member-count">${memberCount} member${memberCount !== 1 ? 's' : ''}</div>
                        ${!isMember ? html`<small>Click to join</small>` : ''}
                    </div>
                `;
            })}
        `, groupsList);
    }

    joinGroup(groupId) {
        const group = this.room.roomState.groups[groupId];
        if (!group) return;

        this.room.updateRoomState({
            groups: {
                ...this.room.roomState.groups,
                [groupId]: {
                    ...group,
                    members: {
                        ...group.members,
                        [this.currentUser.username]: true
                    }
                }
            }
        });

        this.switchGroup(groupId);
    }

    updatePostsList() {
        const postsList = document.getElementById('posts-list');
        const posts = this.room.roomState.posts || {};
        
        const filteredPosts = Object.values(posts)
            .filter(post => post.group === this.activeGroup)
            .sort((a, b) => b.timestamp - a.timestamp);

        const activeGroup = this.room.roomState.groups[this.activeGroup] || { name: 'General' };
        document.getElementById('active-group-name').textContent = activeGroup.name;
        document.getElementById('group-info').textContent = activeGroup.description || '';

        render(html`
            ${filteredPosts.map(post => html`
                <div class="post">
                    <div class="post-header">
                        <span class="post-author">${post.author}</span>
                        <span class="post-timestamp">
                            ${new Date(post.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.imageUrl ? html`
                        <img class="post-image" src="${post.imageUrl}" alt="Post image">
                    ` : ''}
                    <div class="post-group">in ${post.group}</div>
                </div>
            `)}
        `, postsList);
    }

    updateOnlineUsers() {
        // This could be used to show who's online in the current group
        // For now, we'll just update presence
    }

    logout() {
        localStorage.removeItem('forumUser');
        this.currentUser = null;
        if (this.room) {
            this.room.updatePresence({
                ...this.room.presence[this.room.clientId],
                lastSeen: Date.now()
            });
        }
        this.showAuth();
    }
}

// Initialize the app
new ForumApp();