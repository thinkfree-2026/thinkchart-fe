import { createRef } from '../../utils/index.ts';

type ToggleProps = {
  id: string;
  checked?: boolean;
  onChange: (newChecked: boolean) => void;
};

export const Toggle = ({ id, checked = false, onChange }: ToggleProps) => {
  let isChecked = checked;

  const buttonRef = createRef<HTMLButtonElement>(null);
  const thumbRef = createRef<HTMLSpanElement>(null);

  const handleToggleClick = () => {
    isChecked = !isChecked;

    if (buttonRef.current) {
      buttonRef.current.setAttribute('aria-checked', String(isChecked));
      buttonRef.current.classList.toggle('bg-primary', isChecked);
      buttonRef.current.classList.toggle('bg-zinc-300', !isChecked);
    }

    if (thumbRef.current) {
      thumbRef.current.classList.toggle('translate-x-[16px]', isChecked);
      thumbRef.current.classList.toggle('translate-x-0', !isChecked);
    }

    onChange(isChecked);
  };

  return (
    <button
      ref={buttonRef}
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      onclick={handleToggleClick}
      class={`${isChecked ? 'bg-primary' : 'bg-zinc-300'} relative inline-flex h-5 w-9 rounded-full transition-colors duration-200`}
    >
      <span
        ref={thumbRef}
        class={`${isChecked ? 'translate-x-[16px]' : 'translate-x-0'} absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200`}
      ></span>
    </button>
  );
};
