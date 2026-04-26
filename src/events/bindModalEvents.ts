import { closeChartModal, getChartModal } from '../controllers/modalController.ts';

export const bindModalEvents = () => {
  const modal = getChartModal();

  const closeButton = document.getElementById('btn-close-modal') as HTMLButtonElement;

  closeButton?.addEventListener('click', () => {
    closeChartModal();
  });

  modal?.addEventListener('click', e => {
    const rect = modal.getBoundingClientRect();

    const inside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!inside) closeChartModal();
  });
};
