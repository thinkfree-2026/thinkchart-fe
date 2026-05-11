import { Button } from '../../components/common/Button.tsx';

export const FooterActions = ({ onCancel, onApply }: { onCancel?: () => void; onApply?: () => void }) => {
  return (
    <div class="flex h-10 w-full justify-end gap-2">
      <div class="w-1/3">
        <Button label="Cancel" color="outline" onClick={() => onCancel?.()} />
      </div>
      <div class="w-1/3">
        <Button label="Apply" color="primary" onClick={() => onApply?.()} />
      </div>
    </div>
  );
};
