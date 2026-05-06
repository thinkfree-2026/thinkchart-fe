type ChartItemProps = {
  key: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export const ChartItem = ({ label, active, onClick }: ChartItemProps) => {
  return (
    <button
      onclick={onClick}
      class={`w-full rounded-xl px-3 py-2 text-left text-caption transition ${
        active ? 'bg-primary/10 font-semibold text-primary' : 'text-gray-500 hover:bg-gray-100'
      } `}
    >
      {label}
    </button>
  );
};
