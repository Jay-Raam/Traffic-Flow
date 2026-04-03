"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

interface SocketHandlers {
  onTrafficUpdate?: (payload: unknown) => void;
  onAlerts?: (payload: unknown) => void;
}

export function useSocket(handlers: SocketHandlers) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: "/ws/socket.io",
      // Start with polling handshake, then upgrade to websocket.
      transports: ["polling", "websocket"],
    });

    if (handlers.onTrafficUpdate) {
      socket.on("traffic_update", handlers.onTrafficUpdate);
    }
    if (handlers.onAlerts) {
      socket.on("congestion_alerts", handlers.onAlerts);
    }

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [handlers.onTrafficUpdate, handlers.onAlerts]);

  return socketRef;
}
