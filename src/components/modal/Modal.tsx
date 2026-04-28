import type { ChildrenType } from '../../types';

type ModalProps = {
  id: string;
  width?: string;
  height?: string;
  children?: ChildrenType;
};

export const openModal = (id: string) => {
  const modal = document.getElementById(`modal-${id}`) as HTMLDialogElement | null;
  modal?.showModal();
};

export const Modal = ({ id, width = 'w-[1100px]', height = 'h-[720px]', children }: ModalProps) => {
  const closeModal = () => {
    const modal = document.getElementById(`modal-${id}`) as HTMLDialogElement | null;
    modal?.close();
  };

  const handleCloseButtonClick = () => {
    closeModal();
  };

  const handleModalBackdropClick = (e: MouseEvent) => {
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
      className={`${width} ${height} relative m-auto max-h-[90vh] max-w-[95vw] rounded-[24px] bg-white/80 p-10 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-xs`}
      onclick={handleModalBackdropClick}
    >
      <button
        id="btn-close-modal"
        type="button"
        aria-label="Close modal"
        className="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full hover:bg-zinc-300"
        onclick={handleCloseButtonClick}
      >
        ✕
      </button>
      {children}
    </dialog>
  );
};
