import { createRef } from '../../utils/index.ts';

export type AlertType = 'success' | 'error';

export type AlertProps = {
  type: AlertType;
  message: string;
  description?: string;
};

const alertStyles = {
  success: {
    wrapper: 'border-green-200 bg-green-50 text-green-800',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-800',
  },
};

export const openToastMessage = ({
  dom,
  type,
  message,
  description,
}: AlertProps & {
  dom: HTMLElement | null;
}) => {
  dom?.append(<Toast type={type} message={message} description={description} />);
};

export const Toast = ({ type, message, description }: AlertProps) => {
  const alertRef = createRef<HTMLDivElement>(null);

  const style = alertStyles[type];

  const closeAlert = () => {
    const alertElement = alertRef.current;

    if (!alertElement) return;

    alertElement.classList.add('translate-x-full', 'opacity-0');

    setTimeout(() => {
      alertElement.remove();
    }, 300);
  };

  return (
    <div
      ref={alertRef}
      role="alert"
      class={`pointer-events-auto fixed top-4 right-4 z-[9999] flex min-w-[320px] translate-x-full items-start gap-3 rounded-xl border p-4 opacity-0 shadow-lg transition-all duration-300 ease-in-out ${style.wrapper} `}
      onClick={(e: MouseEvent) => e.stopPropagation()}
      oneffect={(alertElement: HTMLDivElement) => {
        requestAnimationFrame(() => {
          alertElement.classList.remove('translate-x-full', 'opacity-0');
        });

        const timer = setTimeout(() => {
          closeAlert();
        }, 1500);

        return () => clearTimeout(timer);
      }}
    >
      <div class="flex-1">
        <div class="font-semibold">{message}</div>

        {description !== undefined && <div class="mt-1 text-sm opacity-80">{description}</div>}
      </div>

      <button
        type="button"
        class="ml-2 shrink-0 cursor-pointer text-lg opacity-60 transition hover:opacity-100"
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          closeAlert();
        }}
      >
        ×
      </button>
    </div>
  );
};
