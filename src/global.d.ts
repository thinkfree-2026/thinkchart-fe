import { createElement as _createElement, Fragment as _Fragment } from './utils/core/dom.js';

declare global {
  // 전역에서 createElement와 Fragment를 인식하도록 설정
  const createElement: typeof _createElement;
  const Fragment: typeof _Fragment;

  namespace JSX {
    // JSX 컴포넌트가 반환하는 타입
    type Element = HTMLElement | DocumentFragment;

    // 기본 HTML 태그 타입 정의
    // TS 컴파일러가 내장 태그를 검사할 때 JSX.IntrinsicElements 참조
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {}; // 이 파일을 모듈로 만들기 위해 필요
