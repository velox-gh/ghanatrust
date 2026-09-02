import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket;

    if (isAuthenticated && user) {
      // Connect to the backend URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // If VITE_API_URL has /api at the end, remove it
      const socketUrl = API_URL.replace('/api', '');

      newSocket = io(socketUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        // Tell the server who we are so we can join our personal room
        newSocket.emit('setup', { id: user.id });
      });

      // Global notification listener
      newSocket.on('new_notification', (data) => {
        // TODO: surface via a toast system (e.g. react-hot-toast) instead of console
        console.log('New notification received:', data);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
