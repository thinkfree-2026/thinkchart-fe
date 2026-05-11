import { Client } from '@stomp/stompjs';

export const websocketClient = new Client({
  brokerURL: `${import.meta.env.VITE_WS_BROKER_URL}`,
  onConnect: () => {
    websocketClient.subscribe('/topic/canvas', () => {});
  },
  onStompError: () => {},
});

export const connectWebSocket = () => {
  websocketClient.activate();
};
