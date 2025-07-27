export class RoomManager {
    constructor() {
        this.room = new WebsimSocket();
        this.roomStateCallbacks = [];
        this.presenceCallbacks = [];
        this.presenceUpdateRequestsCallbacks = [];
    }

    async initialize() {
        await this.room.initialize();
        this.room.subscribeRoomState((currentRoomState) => {
            this.roomStateCallbacks.forEach(cb => cb(currentRoomState));
        });
        this.room.subscribePresence((currentPresence) => {
            this.presenceCallbacks.forEach(cb => cb(currentPresence));
        });
        this.room.subscribePresenceUpdateRequests((updateRequest, fromClientId) => {
            this.presenceUpdateRequestsCallbacks.forEach(cb => cb(updateRequest, fromClientId));
        });
    }

    async initializeRoomDefaults(username) {
        // Initialize room state if empty
        if (!this.room.roomState.groups) {
            this.room.updateRoomState({
                groups: {
                    general: {
                        name: 'General',
                        description: 'Default group for all users',
                        members: {},
                        owner: 'Roleplex', // System user
                        type: 'public',
                        inviteCode: null // Public groups don't need an invite code
                    }
                }
            });
        }

        if (!this.room.roomState.users) {
            this.room.updateRoomState({ users: {} });
        } else if (!this.room.roomState.users[username]) {
            // Ensure the user exists in roomState.users on first login/signup if not already there
            const users = JSON.parse(localStorage.getItem('forumUsers') || '{}');
            const userRole = users[username]?.role || 'user';
            this.room.updateRoomState({
                users: {
                    ...this.room.roomState.users,
                    [username]: {
                        bio: '',
                        avatarUrl: `https://images.websim.com/avatar/${username}?width=128&height=128`,
                        role: userRole
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
        if (this.room.roomState.groups.general && !this.room.roomState.groups.general.members[username]) {
            this.room.updateRoomState({
                groups: {
                    general: {
                        ...this.room.roomState.groups.general,
                        members: {
                            ...this.room.roomState.groups.general.members,
                            [username]: true
                        }
                    }
                }
            });
        }
    }

    subscribeRoomState(callback) {
        this.roomStateCallbacks.push(callback);
        return () => {
            this.roomStateCallbacks = this.roomStateCallbacks.filter(cb => cb !== callback);
        };
    }

    subscribePresence(callback) {
        this.presenceCallbacks.push(callback);
        return () => {
            this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
        };
    }

    subscribePresenceUpdateRequests(callback) {
        this.presenceUpdateRequestsCallbacks.push(callback);
        return () => {
            this.presenceUpdateRequestsCallbacks = this.presenceUpdateRequestsCallbacks.filter(cb => cb !== callback);
        };
    }

    updatePresence(presence) {
        this.room.updatePresence(presence);
    }

    updateRoomState(roomState) {
        this.room.updateRoomState(roomState);
    }

    getRoomState() {
        return this.room.roomState;
    }

    getPresence() {
        return this.room.presence;
    }

    getClientId() {
        return this.room.clientId;
    }
}