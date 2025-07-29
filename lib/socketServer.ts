import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & { io?: IOServer };
  };
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socketio",
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join-session", (sessionId) => {
        socket.join(sessionId);
      });

      socket.on("chat-message", ({ sessionId, message }) => {
        socket.to(sessionId).emit("chat-message", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
