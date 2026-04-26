export const getChartModal = () => {
  return document.getElementById('modal') as HTMLDialogElement;
};

export function openChartModal() {
  getChartModal()?.showModal();
}

export function closeChartModal() {
  getChartModal()?.close();
}
