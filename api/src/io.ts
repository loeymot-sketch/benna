import type { Server as HTTPServer } from 'node:http';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initIO(httpServer: HTTPServer, origin: string | string[]) {
  io = new IOServer(httpServer, {
    cors: { origin, credentials: true },
  });
  io.on('connection', (socket) => {
    socket.on('hello', () => socket.emit('hello', { ok: true }));
  });
  return io;
}

export function emit(event: string, payload: unknown) {
  io?.emit(event, payload);
}
