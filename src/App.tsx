import { Canvas } from './canvas/index.ts';
import { Sidebar } from './components/sidebar/index.ts';
import { connectWebSocket } from './sockets/index.ts';

export const App = () => {
  return (
    <>
      <Sidebar />
      <Canvas />
    </>
  );
};

connectWebSocket();
