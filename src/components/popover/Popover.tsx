import { Button, Input, Slider } from '../common/index.ts';

type PopoverProps = {
  id?: string;
  label?: string;
  value?: number;
  opacity?: number;
  onNameInput?: (value: string) => void;
  onValueInput?: (value: number) => void;
  onOpacityInput?: (value: number) => void;
  onDelete?: () => void;
  onSave?: () => void;
};

export const Popover = ({
  id = 'popover',
  label,
  value,
  opacity = 100,
  onNameInput,
  onValueInput,
  onOpacityInput,
  onDelete,
  onSave,
}: PopoverProps = {}) => {
  return (
    <div id={id} class="w-full rounded-3xl bg-white px-3 py-3 shadow-md">
      <header class="flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-semibold">
            <Input
              value={label}
              onInput={e => {
                const nextValue = (e.currentTarget as HTMLInputElement).value;
                onNameInput?.(nextValue);
              }}
            />
          </div>
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
      <Slider id={`${id}-slider`} value={opacity * 100} onInput={onOpacityInput} />
      <div class="mt-3 h-6 text-xs">
        <Button label="저장" onClick={onSave} />
      </div>
    </div>
  );
};
