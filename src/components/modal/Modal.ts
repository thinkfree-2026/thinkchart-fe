import { html } from '../../util/html.ts';

type ModalProps = {
  width?: string;
  height?: string;
  children?: string;
};

export const Modal = ({ width = 'w-[1100px]', height = 'h-[720px]', children }: ModalProps) => {
  return html` <dialog
    id="modal"
    class="${width} ${height} relative m-auto max-h-[90vh] max-w-[95vw] rounded-[24px] bg-white/80 p-10 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
  >
    <button
      id="btn-close-modal"
      type="button"
      aria-label="Close modal"
      class="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full hover:bg-zinc-300"
    >
      ✕
    </button>
    ${children}
  </dialog>`;
};
