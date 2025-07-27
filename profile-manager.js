import { html, render } from 'lit';

export class ProfileManager {
    constructor(roomManager, getCurrentUser, updateRoomStateCallback, updateHeaderAvatarCallback, uploadFileCallback) {
        this.roomManager = roomManager;
        this.getCurrentUser = getCurrentUser;
        this.updateRoomStateCallback = updateRoomStateCallback;
        this.updateHeaderAvatarCallback = updateHeaderAvatarCallback; // Callback to update header in main app
        this.uploadFileCallback = uploadFileCallback; // websim.upload
        this.profilePicUrl = null; // Temporary state for current profile pic being set in modal
    }

    openProfileModal() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const roomState = this.roomManager.getRoomState();
        const userProfile = roomState.users?.[currentUser.username];

        const profileBioElement = document.getElementById('profile-bio');
        const profilePicPreviewElement = document.getElementById('profile-pic-preview');

        if (userProfile) {
            profileBioElement.value = userProfile.bio || '';
            const avatarToDisplay = userProfile.avatarUrl || `https://images.websim.com/avatar/${currentUser.username}?width=128&height=128`;
            profilePicPreviewElement.src = avatarToDisplay;
            this.profilePicUrl = userProfile.avatarUrl; // Set initial temporary URL from state
        } else {
            // User not in roomState.users yet, default values
            profileBioElement.value = '';
            profilePicPreviewElement.src = `https://images.websim.com/avatar/${currentUser.username}?width=128&height=128`;
            this.profilePicUrl = `https://images.websim.com/avatar/${currentUser.username}?width=128&height=128`;
        }
        document.getElementById('profile-modal').classList.remove('hidden');
    }

    closeProfileModal() {
        document.getElementById('profile-modal').classList.add('hidden');
    }

    async handleProfilePicUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const url = await this.uploadFileCallback(file);
            this.profilePicUrl = url;
            document.getElementById('profile-pic-preview').src = url;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload image. Please try again.');
        }
    }

    saveProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const bio = document.getElementById('profile-bio').value.trim();
        const roomState = this.roomManager.getRoomState();
        const userProfile = roomState.users?.[currentUser.username] || {}; // Get existing or new object

        this.updateRoomStateCallback({
            users: {
                ...roomState.users,
                [currentUser.username]: {
                    ...userProfile, // Preserve existing properties like 'role'
                    bio: bio,
                    avatarUrl: this.profilePicUrl || `https://images.websim.com/avatar/${currentUser.username}?width=128&height=128` // Ensure a default if none selected
                }
            }
        });

        this.updateHeaderAvatarCallback(); // Update main app header avatar immediately
        this.closeProfileModal();
    }

    updateUserProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const roomState = this.roomManager.getRoomState();
        const userProfile = roomState.users?.[currentUser.username];

        if (userProfile) {
            // Update header avatar
            document.getElementById('user-avatar-header').src = userProfile.avatarUrl || `https://images.websim.com/avatar/${currentUser.username}?width=64&height=64`;

            // If modal is open, update its content as well
            if (!document.getElementById('profile-modal').classList.contains('hidden')) {
                document.getElementById('profile-bio').value = userProfile.bio || '';
                document.getElementById('profile-pic-preview').src = userProfile.avatarUrl || `https://images.websim.com/avatar/${currentUser.username}?width=128&height=128`;
                this.profilePicUrl = userProfile.avatarUrl;
            }
        }
    }
}