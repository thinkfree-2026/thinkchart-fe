type ButtonColor = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  id?: string;
  text: string;
  type?: 'button' | 'submit';
  color?: ButtonColor;
  onClick: (e: MouseEvent) => void;
};

const COLOR_CLASS: Record<ButtonColor, string> = {
  primary: `
    bg-primary text-white
    hover:brightness-105
    shadow-lg
  `,

  secondary: `
    bg-secondary text-white
    hover:brightness-105
    shadow-md
  `,

  ghost: `
    bg-transparent text-primary
    hover:bg-primary/10
    shadow-sm
    border
  `,
};

export const Button = ({ id, text, type = 'button', color = 'primary', onClick }: ButtonProps) => {
  return (
    <button
      id={id}
      type={type}
      class={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-8 transition-all duration-200 active:scale-[0.98] ${COLOR_CLASS[color]}`}
      onclick={onClick}
    >
      {text}
    </button>
  );
};
