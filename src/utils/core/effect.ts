const initializeCallbacks = new Map<Node, (el: Node) => void | (() => void)>();
const cleanupCallbacks = new Map<Node, () => void>();

/**
 * @description
 * DOM 변경을 감지해 Initialize 또는 Cleanup 콜백 함수를 실행하는 유틸리티
 *
 * @param {Node} node - 변경을 감지할 노드
 * @param {(element: Node) => void | (() => void)} callback - 변경 감지 후 실행할 콜백 함수
 */
export const createEffect = (node: Node, callback: (element: Node) => void | (() => void)) => {
  if (node.isConnected) {
    const onCleanup = callback(node);

    if (typeof onCleanup === 'function') {
      cleanupCallbacks.set(node, onCleanup);
    }
  } else {
    initializeCallbacks.set(node, callback);
  }
};

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (initializeCallbacks.has(node)) {
        const onInitialize = initializeCallbacks.get(node)!;
        const onCleanup = onInitialize(node); // Initialize 콜백 함수 실행

        if (typeof onCleanup === 'function') {
          cleanupCallbacks.set(node, onCleanup);
        }

        initializeCallbacks.delete(node);
      }
    });

    mutation.removedNodes.forEach(node => {
      if (cleanupCallbacks.has(node)) {
        cleanupCallbacks.get(node)!(); // Cleanup 콜백 함수 실행
        cleanupCallbacks.delete(node);
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
