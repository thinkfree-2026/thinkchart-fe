import './styles/global.css';

import { App } from './App.tsx';

const root = document.getElementById('app') as HTMLDivElement;
export const modalRoot = document.getElementById('modal-root') as HTMLDivElement;
export const toastRoot = document.getElementById('toast-root') as HTMLDivElement;

function render() {
  root.innerHTML = '';
  root.appendChild(App());
}

render();
