type InputProps = {
  id?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onInput?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  style?: string;
};

export const Input = ({
  id,
  type = 'text',
  value = '',
  placeholder = '',
  disabled = false,
  onInput,
  onBlur,
  style,
}: InputProps = {}) => {
  return (
    <input
      id={id}
      class={`h-8 w-full rounded-full border border-zinc-200 bg-zinc-50 px-3 transition outline-none placeholder:text-sm focus:border-primary ${style}`}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onInput={onInput}
      onBlur={onBlur}
    />
  );
};
