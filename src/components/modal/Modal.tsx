import { chartListState } from '../../store/index.ts';
import type { ChildrenType } from '../../types/index.ts';
import { createRef } from '../../utils/index.ts';

type ModalProps = {
  id: string;
  width?: string;
  height?: string;
  children?: ChildrenType;
  onClose?: () => void;
};

export const toastLayerRef = createRef<HTMLDivElement>(null);

export const Modal = ({ id, width = 'w-[1100px]', height = 'h-[720px]', children, onClose }: ModalProps) => {
  const modalRef = createRef<HTMLDialogElement>(null);

  const closeModal = () => {
    modalRef.current?.close();
    modalRef.current?.remove();
    chartListState.activeId = null;
    onClose?.();
  };

  const handleCloseButtonClick = () => {
    closeModal();
  };

  const handleModalBackdropClick = (e: MouseEvent) => {
    if (document.body.dataset.chartDragging === 'true') {
      return;
    }

    const modal = e.currentTarget as HTMLDialogElement;

    const rect = modal.getBoundingClientRect();

    const isClickOutside =
      e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right;

    if (isClickOutside) {
      closeModal();
    }
  };

  return (
    <dialog
      id={`modal-${id}`}
      ref={modalRef}
      class={`${width} ${height} fixed inset-0 m-auto max-w-[95vw] rounded-[24px] bg-white/80 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-xs`}
      onclick={handleModalBackdropClick}
      oneffect={(modalElement: HTMLDialogElement) => {
        modalElement.showModal();
      }}
    >
      <button
        id="btn-close-modal"
        type="button"
        aria-label="Close modal"
        class="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full hover:bg-zinc-100/60"
        onclick={handleCloseButtonClick}
      >
        ✕
      </button>
      <div ref={toastLayerRef} class="pointer-events-none z-50" />
      {children}
    </dialog>
  );
};
