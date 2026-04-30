/**
 * JSX 문법을 실제 DOM 노드로 변환하는 핵심 렌더링 함수입니다.
 * @param {string|function} tag - HTML 태그 문자열 또는 커스텀 컴포넌트 함수
 * @param {Object|null} props - 태그에 전달될 속성 객체
 * @param {...any} children - 자식 노드들
 * @returns {Node} 생성된 DOM 노드
 */
export function createElement(tag, props, ...children) {
  // 태그가 커스텀 컴포넌트(함수)인 경우
  if (typeof tag === 'function') {
    const componentProps = props || {};

    if (children.length > 0) {
      componentProps.children = children.length === 1 ? children[0] : children;
    }

    return tag(componentProps);
  }

  // SVG 요소인지 확인
  const isSVG = ['svg', 'path', 'circle', 'rect', 'line', 'g'].includes(tag);
  const element = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);

  if (props) {
    applyProps(element, props);
  }

  if (children.length > 0) {
    // 중첩된 배열을 평탄화하여 자식 요소 추가
    appendChildren(element, children.flat(Infinity));
  }

  return element;
}

/**
 * 생성된 DOM 엘리먼트에 속성과 이벤트 리스너를 바인딩합니다.
 * @param {HTMLElement|SVGElement} element
 * @param {Object} props
 */
function applyProps(element, props) {
  const isSVG = element instanceof SVGElement;

  Object.keys(props).forEach(key => {
    const value = props[key];
    if (value === undefined || value === null) return;

    if (key === 'ref' && value && typeof value === 'object') {
      value.current = element;
      return;
    }

    // className 처리 (SVG 호환성을 위해 setAttribute 사용)
    if (key === 'className') {
      element.setAttribute('class', String(value));
      return;
    }

    // 이벤트 리스너 처리 (onClick -> click)
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
      return;
    }

    // style 객체 처리
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
      return;
    }

    // dataset 처리
    if (key === 'dataset' && typeof value === 'object') {
      Object.keys(value).forEach(dataKey => {
        element.dataset[dataKey] = value[dataKey] ?? '';
      });
      return;
    }

    // SVG 요소이거나 일반 속성이 아닌 경우 setAttribute 사용
    if (isSVG || !(key in element)) {
      element.setAttribute(key, String(value));
    } else {
      element[key] = value;
    }
  });
}

/**
 * 부모 엘리먼트에 자식 노드들을 추가합니다.
 * @param {Node} element
 * @param {any[]} children
 */
function appendChildren(element, children) {
  children.forEach(child => {
    // null, undefined, boolean은 렌더링하지 않음
    if (child === null || child === undefined || typeof child === 'boolean') {
      return;
    }

    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
}

/**
 * 렌더링되지 않는 빈 껍데기 노드를 생성합니다. (<></>)
 * @param {Object} props
 * @returns {DocumentFragment}
 */
export function Fragment(props) {
  const fragment = document.createDocumentFragment();

  // props.children이 단일 노드일 수도, 배열일 수도 있으므로 안전하게 배열로 만들어 평탄화
  if (props && props.children !== null && props.children !== undefined) {
    const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
    appendChildren(fragment, childrenArray.flat(Infinity));
  }

  return fragment;
}
