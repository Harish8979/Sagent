import { Client } from '@stomp/stompjs';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { getWebSocketUrl } from '../lib/api';

const SESSION_STORAGE_KEY = 'pulse-seats-session-id';
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [clientSessionId] = useState(() => {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated = window.crypto?.randomUUID?.() || `session-${Date.now()}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  });

  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        'x-client-session-id': clientSessionId,
      },
      debug: () => {},
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, [clientSessionId]);

  return (
    <SessionContext.Provider
      value={{
        clientSessionId,
        connected,
        stompClient: clientRef.current,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
