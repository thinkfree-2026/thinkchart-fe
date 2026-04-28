type ToggleProps = {
  id: string;
  checked?: boolean;
};

export const Toggle = ({ id, checked = false }: ToggleProps) => {
  const handleToggleClick = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLButtonElement;
    const nextChecked = button.getAttribute('aria-checked') !== 'true';

    button.setAttribute('aria-checked', String(nextChecked));

    button.classList.toggle('bg-primary', nextChecked);
    button.classList.toggle('bg-zinc-300', !nextChecked);

    const thumb = button.querySelector('span');

    if (thumb) {
      thumb.classList.toggle('translate-x-[16px]', nextChecked);
      thumb.classList.toggle('translate-x-0', !nextChecked);
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onclick={handleToggleClick}
      class={`${checked ? 'bg-primary' : 'bg-zinc-300'} relative inline-flex h-5 w-9 rounded-full transition-colors duration-200`}
    >
      <span
        class={`${checked ? 'translate-x-[16px]' : 'translate-x-0'} absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200`}
      ></span>
    </button>
  );
};
