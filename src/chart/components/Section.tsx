import type { ChildrenType } from '../../types/index.ts';

type SectionProps = {
  title?: string;
  children?: ChildrenType;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-semibold tracking-widest text-primary">{title}</span>
      {children}
    </div>
  );
};
