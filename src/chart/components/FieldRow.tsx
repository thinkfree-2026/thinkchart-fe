import type { ChildrenType } from '../../types/index.ts';

export const FieldRow = ({ label, toggle }: { label: string; toggle: ChildrenType }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      {toggle}
    </div>
  );
};
