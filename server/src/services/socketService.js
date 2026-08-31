import { Server } from 'socket.io';

let io;
// Map to keep track of connected users (userId -> socketId)
const connectedUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true, // Allow frontend origin
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Client emits 'setup' with their user ID upon logging in
    socket.on('setup', (userData) => {
      if (userData && userData.id) {
        connectedUsers.set(userData.id, socket.id);
        socket.join(`user_${userData.id}`); // Also join a personal room
        console.log(`User ${userData.id} connected to socket ${socket.id}`);
      }
    });

    // Client joins a specific booking room to chat
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User joined booking room: booking_${bookingId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove user from connected users map
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Utility to get a user's socket ID if they are connected
export const getUserSocketId = (userId) => {
  return connectedUsers.get(userId);
};
