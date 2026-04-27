type ModalProps = {
  width?: string;
  height?: string;
  children?: HTMLElement;
};

export const Modal = ({ width = 'w-[1100px]', height = 'h-[720px]', children }: ModalProps) => {
  const onClickedCloseModal = () => {
    const modal = document.getElementById('modal') as HTMLDialogElement | null;
    modal?.close();
  };

  const onCloseModal = (e: MouseEvent) => {
    const modal = document.getElementById('modal') as HTMLDialogElement | null;

    if (!modal) return;

    const rect = modal.getBoundingClientRect();

    const inside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!inside) modal.close();
  };

  console.log('childdd:::: ', children);

  return (
    <dialog
      id="modal"
      className={`${width} ${height} relative m-auto max-h-[90vh] max-w-[95vw] rounded-[24px] bg-white/80 p-10 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]`}
      onclick={onCloseModal}
    >
      <button
        id="btn-close-modal"
        type="button"
        aria-label="Close modal"
        className="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full hover:bg-zinc-300"
        onclick={onClickedCloseModal}
      >
        ✕
      </button>
      {children}
    </dialog>
  );
};
