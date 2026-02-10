import { io } from 'socket.io-client';
import { browser } from '$app/environment';

let socket = null;

export function getSocket() {
	if (!browser) return null;

	if (socket) return socket;

	const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

	socket = io(url, {
		transports: ['websocket'],
		withCredentials: true,
		autoConnect: true
	});

	return socket;
}
