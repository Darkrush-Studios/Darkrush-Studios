import { html, render } from 'lit';

export class GroupManager {
    constructor(roomManager, getCurrentUser, updateRoomStateCallback, onGroupSwitchCallback) {
        this.roomManager = roomManager;
        this.getCurrentUser = getCurrentUser;
        this.updateRoomStateCallback = updateRoomStateCallback;
        this.onGroupSwitchCallback = onGroupSwitchCallback;
        this.activeGroup = 'general'; // Default group
    }

    createGroup() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const groupNameInput = document.getElementById('new-group-name');
        const groupName = groupNameInput.value.trim();
        if (!groupName) return;

        const groupId = groupName.toLowerCase().replace(/\s+/g, '-');
        const groups = this.roomManager.getRoomState().groups || {};

        if (groups[groupId]) {
            alert('Group already exists!');
            return;
        }

        const newGroup = {
            name: groupName,
            description: `A private group created by ${currentUser.username}`,
            owner: currentUser.username,
            members: {
                [currentUser.username]: true
            },
            type: 'private',
            inviteCode: Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
        };

        this.updateRoomStateCallback({
            groups: {
                ...groups,
                [groupId]: newGroup
            }
        });

        groupNameInput.value = '';
        this.switchGroup(groupId); // Automatically switch to the new group
    }

    switchGroup(groupId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        this.activeGroup = groupId;
        // Update user's presence to reflect active group
        this.roomManager.updatePresence({
            username: currentUser.username,
            activeGroup: groupId,
            lastSeen: Date.now()
        });
        this.onGroupSwitchCallback(groupId); // Notify PostManager to update its view
        this.updateGroupsList(); // Re-render to show active group style
    }

    joinPublicGroup(groupId) {
        const group = this.roomManager.getRoomState().groups[groupId];
        const currentUser = this.getCurrentUser();
        if (!group || !currentUser || group.type !== 'public') return;

        this.updateRoomStateCallback({
            groups: {
                ...this.roomManager.getRoomState().groups,
                [groupId]: {
                    ...group,
                    members: {
                        ...group.members,
                        [currentUser.username]: true
                    }
                }
            }
        });

        this.switchGroup(groupId);
    }

    joinGroupWithCode() {
        const currentUser = this.getCurrentUser();
        const codeInput = document.getElementById('group-invite-code');
        const code = codeInput.value.trim();
        if (!code || !currentUser) return;

        const roomState = this.roomManager.getRoomState();
        const groups = roomState.groups || {};

        const targetGroupEntry = Object.entries(groups).find(([, group]) => group && group.type === 'private' && group.inviteCode === code);

        if (!targetGroupEntry) {
            alert('Invalid or expired invite code.');
            return;
        }

        const [groupId, group] = targetGroupEntry;

        if (group.members[currentUser.username]) {
            alert('You are already a member of this group.');
            codeInput.value = '';
            this.switchGroup(groupId);
            return;
        }

        this.updateRoomStateCallback({
            groups: {
                ...groups,
                [groupId]: {
                    ...group,
                    members: {
                        ...group.members,
                        [currentUser.username]: true
                    }
                }
            }
        });

        codeInput.value = '';
        this.switchGroup(groupId);
    }

    deleteGroup(groupId) {
        const currentUser = this.getCurrentUser();
        const groupToDelete = this.roomManager.getRoomState().groups[groupId];

        if (!currentUser || !groupToDelete) return;
        
        if (currentUser.role !== 'admin' && currentUser.username !== groupToDelete.owner) {
            alert("Only the group owner or an admin can delete this group.");
            return;
        }

        if (groupId === 'general') {
            alert("Cannot delete the General group.");
            return;
        }
        if (!confirm('Are you sure you want to delete this group and all its posts? This action cannot be undone.')) return;

        const roomState = this.roomManager.getRoomState();
        const postsToDelete = Object.entries(roomState.posts || {})
            .filter(([, post]) => post && post.group === groupId)
            .reduce((acc, [id]) => ({ ...acc, [id]: null }), {});

        this.updateRoomStateCallback({
            groups: {
                [groupId]: null
            },
            posts: postsToDelete
        });

        if (this.activeGroup === groupId) {
            this.switchGroup('general'); // Switch to general after deleting active group
        }
    }

    updateGroupsList() {
        const groupsListElement = document.getElementById('groups-list');
        const roomState = this.roomManager.getRoomState();
        const currentUser = this.getCurrentUser();
        if (!roomState || !roomState.groups || !currentUser) return;

        const groups = roomState.groups;
        
        const visibleGroups = Object.entries(groups).filter(([, group]) => {
            if (!group) return false;
            // Show public groups and private groups the user is a member of
            return group.type === 'public' || (group.members && group.members[currentUser.username]);
        });

        render(html`
            ${visibleGroups.map(([groupId, group]) => {
                const isMember = group.members[currentUser.username];
                const memberCount = Object.keys(group.members || {}).length;
                const isActive = groupId === this.activeGroup;
                const isOwner = group.owner === currentUser.username;

                return html`
                    <div class="group-item ${isActive ? 'active' : ''}">
                        <div class="group-details" @click=${() => isMember ? this.switchGroup(groupId) : (group.type === 'public' ? this.joinPublicGroup(groupId) : null)}>
                            <div class="group-name">${group.name} ${group.type === 'private' ? '🔒' : ''}</div>
                            <div class="member-count">${memberCount} member${memberCount !== 1 ? 's' : ''}</div>
                            ${!isMember && group.type === 'public' ? html`<small>Click to join</small>` : ''}
                            ${isOwner ? html`
                                <div class="invite-code-container">
                                    <span>Invite Code: </span>
                                    <input class="invite-code-input" type="text" readonly value=${group.inviteCode} @click=${e => {e.stopPropagation(); e.target.select();}}>
                                </div>` 
                            : ''}
                        </div>
                         ${(isOwner || currentUser.role === 'admin') && group.type !== 'public' ? html`
                            <button class="delete-btn" @click=${(e) => { e.stopPropagation(); this.deleteGroup(groupId);}}>Delete</button>
                        ` : ''}
                    </div>
                `;
            })}
        `, groupsListElement);
    }

    getActiveGroup() {
        return this.activeGroup;
    }
}