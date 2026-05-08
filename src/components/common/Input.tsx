type InputProps = {
  id?: string;
  type?: string;
  value?: string | number;
  placeholder?: string;
  onInput?: (e: Event) => void;
  onBlur?: (e: Event) => void;
};

export const Input = ({ id, type = 'string', value = '', placeholder = '', onInput, onBlur }: InputProps = {}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onInput={onInput}
      onBlur={onBlur}
      class="h-8 w-full rounded-full border border-zinc-200 bg-zinc-50 px-3 transition outline-none placeholder:text-sm focus:border-primary"
    />
  );
};
