import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket && this.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinProject(projectId, userId, branch) {
        if (this.socket) {
            this.socket.emit('join-project', { projectId, userId, branch });
        }
    }

    sendCodeChange(data) {
        if (this.socket) {
            this.socket.emit('code-change', data);
        }
    }

    sendCursorMove(data) {
        if (this.socket) {
            this.socket.emit('cursor-move', data);
        }
    }

    sendFileOpen(data) {
        if (this.socket) {
            this.socket.emit('file-open', data);
        }
    }

    notifyChangeSubmitted(data) {
        if (this.socket) {
            this.socket.emit('change-submitted', data);
        }
    }

    notifyChangeReviewed(data) {
        if (this.socket) {
            this.socket.emit('change-reviewed', data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;
