import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL || "";
    if (!url) {
      // Dev/demo: fallback til lokal EventEmitter-lignende API
      // @ts-expect-error simplify mock socket
      socket = {
        on: () => {},
        off: () => {},
        emit: () => {},
      };
      return socket as unknown as Socket;
    }
    socket = io(url, { transports: ["websocket"], autoConnect: true });
  }
  return socket;
}


