type ButtonColor = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
  label: string;
  type?: 'button' | 'submit';
  color?: ButtonColor;
  onClick?: () => void;
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

  outline: `
    bg-transparent text-primary
    hover:bg-primary/10
    shadow-sm
    border
  `,
};

export const Button = ({ label, type = 'button', color = 'primary', onClick }: ButtonProps) => {
  return (
    <button
      type={type}
      class={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full transition-all duration-200 active:scale-[0.98] ${COLOR_CLASS[color]}`}
      onclick={onClick}
    >
      {label}
    </button>
  );
};
