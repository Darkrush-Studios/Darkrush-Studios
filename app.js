import { html, render } from 'lit';
import { AuthManager } from './auth-manager.js';
import { RoomManager } from './room-manager.js';
import { GroupManager } from './group-manager.js';
import { PostManager } from './post-manager.js';
import { ProfileManager } from './profile-manager.js';

class ForumApp {
    constructor() {
        this.currentUser = null;
        this.roomManager = null;
        this.authManager = null;
        this.groupManager = null;
        this.postManager = null;
        this.profileManager = null;

        this.init();
    }

    async init() {
        this.authManager = new AuthManager(
            this.handleLoginSuccess.bind(this),
            this.handleLogout.bind(this)
        );

        this.setupMainEventListeners(); // Set up listeners that belong to the main app structure
        this.checkAuthState();
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('forumUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
            this.initializeRoomAndManagers();
        } else {
            this.authManager.showAuth();
        }
    }

    async handleLoginSuccess(user) {
        this.currentUser = user;
        localStorage.setItem('forumUser', JSON.stringify(this.currentUser));
        this.showMainApp();
        await this.initializeRoomAndManagers();
    }

    handleLogout() {
        localStorage.removeItem('forumUser');
        this.currentUser = null;
        if (this.roomManager) {
            this.roomManager.updatePresence({ lastSeen: Date.now() }); // Update last seen on logout
            // Optional: Disconnect the room if no further state is needed (e.g., if re-connecting on next login)
            // this.roomManager.disconnect();
        }
        this.authManager.showAuth();
        // Clear main UI content
        document.getElementById('groups-list').innerHTML = '';
        document.getElementById('posts-list').innerHTML = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('post-content').value = '';
        document.getElementById('new-group-name').value = '';
        document.getElementById('active-group-name').textContent = 'General';
        document.getElementById('group-info').textContent = 'Default group for all users';
        document.getElementById('user-avatar-header').src = 'https://images.websim.com/avatar/default?width=64&height=64';
    }

    showMainApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        this.updateHeaderUserInfo();
    }

    updateHeaderUserInfo() {
        if (this.currentUser) {
            document.getElementById('current-user').textContent = this.currentUser.username;
            // Avatar will be updated by ProfileManager if a custom one exists in roomState
            document.getElementById('user-avatar-header').src = `https://images.websim.com/avatar/${this.currentUser.username}?width=64&height=64`;
        }
    }

    async initializeRoomAndManagers() {
        if (this.roomManager) {
            // Already initialized, no need to re-init WebsimSocket unless it was explicitly disconnected
            // If the WebsimSocket instance needs to be refreshed on re-login, handle it here.
            // For this design, we'll assume it's OK to re-subscribe if already connected.
        } else {
            this.roomManager = new RoomManager();
            await this.roomManager.initialize();
        }

        // Initialize managers, passing necessary dependencies
        this.groupManager = new GroupManager(
            this.roomManager,
            () => this.currentUser,
            this.roomManager.updateRoomState.bind(this.roomManager),
            (groupId) => this.postManager.updateActiveGroup(groupId) // Callback to inform PostManager of group change
        );

        this.postManager = new PostManager(
            this.roomManager,
            () => this.currentUser,
            this.groupManager.getActiveGroup.bind(this.groupManager), // Get active group from GroupManager
            this.roomManager.updateRoomState.bind(this.roomManager),
            websim.upload // Pass websim.upload directly
        );

        this.profileManager = new ProfileManager(
            this.roomManager,
            () => this.currentUser,
            this.roomManager.updateRoomState.bind(this.roomManager),
            this.updateHeaderUserInfo.bind(this), // Callback to update main app header avatar
            websim.upload // Pass websim.upload directly
        );

        // Initial setup for the room state and user's group membership
        await this.roomManager.initializeRoomDefaults(this.currentUser.username);

        // Subscribe managers to global room state and presence updates
        this.roomManager.subscribeRoomState(() => {
            this.groupManager.updateGroupsList();
            this.postManager.updatePostsList();
            this.profileManager.updateUserProfile();
        });

        this.roomManager.subscribePresence(() => {
            this.groupManager.updateGroupsList(); // To show member counts/online status
            // No specific online user display, but presence changes are globally available.
        });

        // Set initial user presence
        this.roomManager.updatePresence({
            username: this.currentUser.username,
            activeGroup: this.groupManager.getActiveGroup(), // Ensure active group is set in presence
            lastSeen: Date.now()
        });

        // Trigger initial UI renders for active components
        this.groupManager.updateGroupsList();
        this.postManager.updatePostsList();
        this.profileManager.updateUserProfile(); // Ensures header avatar is set based on profile data
    }

    setupMainEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Group creation
        document.getElementById('create-group-btn').addEventListener('click', () => {
            if (this.groupManager) this.groupManager.createGroup();
        });

        // Group joining with invite code
        document.getElementById('join-group-btn').addEventListener('click', () => {
            if (this.groupManager) this.groupManager.joinGroupWithCode();
        });

        // Post creation
        document.getElementById('post-btn').addEventListener('click', () => {
            if (this.postManager) this.postManager.createPost();
        });

        // Post image upload
        document.getElementById('upload-image-btn').addEventListener('click', () => {
            document.getElementById('post-image').click();
        });
        document.getElementById('post-image').addEventListener('change', (e) => {
            if (this.postManager) this.postManager.handleImageUpload(e);
        });

        // Profile modal
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            if (this.profileManager) this.profileManager.openProfileModal();
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            if (this.profileManager) this.profileManager.closeProfileModal();
        });
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.profileManager) this.profileManager.saveProfile();
        });
        document.getElementById('profile-pic-upload').addEventListener('change', (e) => {
            if (this.profileManager) this.profileManager.handleProfilePicUpload(e);
        });
    }
}

// Initialize the app
new ForumApp();