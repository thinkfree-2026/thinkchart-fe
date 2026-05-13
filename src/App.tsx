import { api, type ApiResponse } from './api/http.ts';
import { Canvas } from './canvas/index.ts';
import { Sidebar } from './components/sidebar/index.ts';
import { connectWebSocket } from './sockets/index.ts';
import { chartListState } from './store/index.ts';
import type { ChartList } from './types/api/chartAPI.ts';

const getChartList = async () => {
  const res: ApiResponse<ChartList> = await api.get('/canvas/charts');
  chartListState.charts = res.data;
};

export const App = () => {
  void getChartList();

  return (
    <>
      <Sidebar />
      <Canvas />
    </>
  );
};

connectWebSocket();
