import { html, render } from 'lit';

export class PostManager {
    constructor(roomManager, getCurrentUser, getActiveGroupCallback, updateRoomStateCallback, uploadFileCallback) {
        this.roomManager = roomManager;
        this.getCurrentUser = getCurrentUser;
        this.getActiveGroup = getActiveGroupCallback;
        this.updateRoomStateCallback = updateRoomStateCallback;
        this.uploadFileCallback = uploadFileCallback; 
        this.currentImageUrl = null;
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const url = await this.uploadFileCallback(file);
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
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const postContentInput = document.getElementById('post-content');
        const content = postContentInput.value.trim();
        const activeGroup = this.getActiveGroup();

        if (!content && !this.currentImageUrl) return; 

        const postId = Date.now().toString(); 
        const post = {
            id: postId,
            content,
            author: currentUser.username,
            group: activeGroup,
            timestamp: Date.now(),
            imageUrl: this.currentImageUrl
        };

        this.updateRoomStateCallback({
            posts: {
                ...this.roomManager.getRoomState().posts,
                [postId]: post
            }
        });

        postContentInput.value = '';
        this.removeImage(); 
    }

    deletePost(postId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const postToDelete = this.roomManager.getRoomState().posts[postId];
        if (!postToDelete) return;

        if (currentUser.username !== postToDelete.author && currentUser.role !== 'admin') {
            alert("You do not have permission to delete this post.");
            return;
        }

        if (!confirm('Are you sure you want to delete this post?')) return;

        this.updateRoomStateCallback({
            posts: {
                [postId]: null 
            }
        });
    }

    updatePostsList() {
        const postsListElement = document.getElementById('posts-list');
        const roomState = this.roomManager.getRoomState();
        const currentUser = this.getCurrentUser();
        if (!roomState || !roomState.posts || !currentUser) return;

        const posts = roomState.posts;
        const users = roomState.users || {};
        const activeGroup = this.getActiveGroup();

        const filteredPosts = Object.values(posts)
            .filter(post => post && post.group === activeGroup) 
            .sort((a, b) => b.timestamp - a.timestamp); 

        const currentGroupData = roomState.groups[activeGroup] || { name: 'General', description: 'Default group for all users' };
        document.getElementById('active-group-name').textContent = currentGroupData.name;
        document.getElementById('group-info').textContent = currentGroupData.description || '';

        render(html`
            ${filteredPosts.map(post => {
                const authorProfile = users[post.author] || {};
                const avatarUrl = authorProfile.avatarUrl || `https://images.websim.com/avatar/${post.author}?width=64&height=64`;
                const isAdmin = authorProfile.role === 'admin';
                const isAuthorOrAdmin = currentUser.username === post.author || currentUser.role === 'admin';

                return html`
                    <div class="post">
                        <div class="post-header">
                            <div class="post-author-info">
                                <img class="avatar-small" src=${avatarUrl} alt="${post.author}'s avatar">
                                <span class="post-author">${post.author}</span>
                                ${isAdmin ? html`<span class="admin-badge">Admin</span>` : ''}
                            </div>
                            <span class="post-timestamp">
                                ${new Date(post.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <div class="post-content">${post.content}</div>
                        ${post.imageUrl ? html`
                            <img class="post-image" src="${post.imageUrl}" alt="Post image">
                        ` : ''}
                        <div class="post-footer">
                            <div class="post-group">in ${currentGroupData.name}</div>
                            ${isAuthorOrAdmin ? html`
                                <button class="delete-btn" @click=${() => this.deletePost(post.id)}>Delete</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            })}
        `, postsListElement);
    }

    updateActiveGroup(groupId) {
        this.updatePostsList(); 
    }
}