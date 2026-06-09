const socketIO = require("socket.io");

let io;

/**
 * Initialize Socket.IO server
 * @param {import("http").Server} server - HTTP server instance
 */
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins a meeting room
    socket.on("join-meeting", ({ meetingId, userId, userName }) => {
      socket.join(meetingId);
      socket.data.meetingId = meetingId;
      socket.data.userId = userId;
      socket.data.userName = userName;

      // Notify others in the room
      socket.to(meetingId).emit("user-joined", {
        userId,
        userName,
        timestamp: new Date().toISOString()
      });

      // Send current room users
      const roomUsers = io.sockets.adapter.rooms.get(meetingId);
      const users = Array.from(roomUsers || []).map(sid => {
        const s = io.sockets.sockets.get(sid);
        return {
          socketId: sid,
          userId: s?.data?.userId,
          userName: s?.data?.userName
        };
      });

      socket.emit("room-users", { users, meetingId });
    });

    // User leaves a room
    socket.on("leave-meeting", ({ meetingId }) => {
      socket.leave(meetingId);
      socket.to(meetingId).emit("user-left", {
        userId: socket.data.userId,
        userName: socket.data.userName,
        timestamp: new Date().toISOString()
      });
    });

    // Signaling: send offer to another user
    socket.on("send-offer", ({ meetingId, targetId, offer }) => {
      socket.to(targetId).emit("receive-offer", {
        from: socket.data.userId,
        fromName: socket.data.userName,
        offer
      });
    });

    // Signaling: send answer to another user
    socket.on("send-answer", ({ targetId, answer }) => {
      socket.to(targetId).emit("receive-answer", {
        from: socket.data.userId,
        answer
      });
    });

    // Signaling: send ICE candidate
    socket.on("send-ice-candidate", ({ targetId, candidate }) => {
      socket.to(targetId).emit("receive-ice-candidate", {
        from: socket.data.userId,
        candidate
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.data.meetingId) {
        socket.to(socket.data.meetingId).emit("user-disconnected", {
          userId: socket.data.userId,
          userName: socket.data.userName,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocket first.");
  }
  return io;
};

module.exports = { initSocket, getIO };
