import { ChartList } from './ChartList.tsx';

export const Sidebar = () => {
  return (
    <div class="fixed flex h-screen">
      <div class="my-3 ml-3 flex w-60 flex-col gap-6 rounded-3xl bg-white/90 px-5 py-6 shadow-2xl">
        <div class="px-2">
          <div class="font-bold text-primary">ThinkChart</div>
          <div class="mt-1 text-caption text-gray-300">Collaborative Space</div>
        </div>
        <ChartList />
      </div>
    </div>
  );
};
