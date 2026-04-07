// src/components/messaging/OnlineStatus.js
import React from 'react';
import { useSocket } from '../../context/SocketContext';

const OnlineStatus = ({ userId }) => {
  const { isUserOnline } = useSocket();
  const online = isUserOnline(userId);

  return (
    <span
      className={`online-dot ${online ? 'online' : 'offline'}`}
      title={online ? 'En línea' : 'Desconectado'}
    />
  );
};

export default OnlineStatus;
