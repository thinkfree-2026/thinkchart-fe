import './styles/global.css';

import { App } from './App.tsx';

const root = document.getElementById('app') as HTMLDivElement;

function render() {
  root.innerHTML = '';
  root.appendChild(App());
}

render();
