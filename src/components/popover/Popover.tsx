import { Input, Slider } from '../common/index.ts';

type PopoverProps = {
  id?: string;
  label?: string;
  value?: number;
  opacity?: number;
  onValueInput?: (value: number) => void;
  onOpacityInput?: (value: number) => void;
  onDelete?: () => void;
};

export const Popover = ({
  id = 'popover',
  label,
  value,
  opacity = 100,
  onValueInput,
  onOpacityInput,
  onDelete,
}: PopoverProps = {}) => {
  return (
    <div id={id} class="w-full rounded-3xl bg-white px-3 py-3 shadow-md">
      <header class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold">{label}</div>
        </div>
        <button type="button" onclick={onDelete} class="text-sm transition hover:opacity-70" aria-label="Delete">
          🗑
        </button>
      </header>
      <div class="my-3 h-px bg-zinc-200"></div>
      <Input
        id={`${id}-input`}
        type="number"
        value={value}
        onInput={e => {
          const nextValue = Number((e.currentTarget as HTMLInputElement).value);
          if (!Number.isFinite(nextValue)) return;
          onValueInput?.(nextValue);
        }}
      />
      <Slider id={`${id}-slider`} value={opacity} onInput={onOpacityInput} />
    </div>
  );
};
