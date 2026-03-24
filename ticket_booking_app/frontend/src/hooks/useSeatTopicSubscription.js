import { useEffect, useRef } from 'react';

import { useSession } from '../context/SessionContext';

export function useSeatTopicSubscription(showtimeId, onUpdate) {
  const { connected, stompClient } = useSession();
  const updateRef = useRef(onUpdate);

  useEffect(() => {
    updateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!showtimeId || !connected || !stompClient) {
      return undefined;
    }

    const subscription = stompClient.subscribe(`/topic/showtimes/${showtimeId}/seats`, (message) => {
      const payload = JSON.parse(message.body);
      updateRef.current(payload);
    });

    stompClient.publish({
      destination: `/app/showtimes/${showtimeId}/snapshot`,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showtimeId, connected, stompClient]);
}
