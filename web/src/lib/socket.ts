import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from './config';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_ORIGIN || undefined, { path: '/socket.io', autoConnect: true, transports: ['websocket', 'polling'] });
  }
  return socket;
}
