import { html } from '../../util/html.ts';

import { Modal } from './Modal.ts';

export const ChartModal = () => {
  const chart = html`<div>chart</div>`;

  return Modal({ children: chart });
};
