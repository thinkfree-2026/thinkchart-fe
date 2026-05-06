type ChartItemProps = {
  id: string;
  label: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export const ChartItem = ({ id, label, isActive, onSelect, onDelete }: ChartItemProps) => {
  const handleClick = () => onSelect(id);

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      onclick={handleClick}
      class={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-caption transition ${
        isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-gray-500 hover:bg-gray-100'
      } `}
    >
      <span>{label}</span>
      <button
        class="text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
        onclick={handleDeleteClick}
      >
        ✕
      </button>
    </div>
  );
};
