import { Input } from '../common/index.ts';
import { Slider } from '../common/index.ts';

type PopoverProps = {
  id?: string;
  title?: string;
  value?: number;
  onDelete?: () => void;
};

export const Popover = ({ id = 'popover', title = 'Bar Options', value, onDelete }: PopoverProps = {}) => {
  return (
    <div id={id} class="w-full rounded-3xl bg-white px-3 py-3 shadow-md">
      <header class="flex items-center justify-between">
        <div class="text-sm font-semibold">{title}</div>
        <button type="button" onclick={onDelete} class="text-sm transition hover:opacity-70">
          🗑
        </button>
      </header>
      <div class="my-3 h-px bg-zinc-200"></div>
      <Input id={`${id}-input`} type="number" value={value} />
      <Slider id={`${id}-slider`} />
    </div>
  );
};
