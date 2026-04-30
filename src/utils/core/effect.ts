const initializeCallbacks = new Map<Node, (el: Node) => void | (() => void)>();
const cleanupCallbacks = new Map<Node, () => void>();

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

export const createEffect = (node: Node, callback: (el: Node) => void | (() => void)) => {
  if (node.isConnected) {
    const onCleanup = callback(node);

    if (typeof onCleanup === 'function') {
      cleanupCallbacks.set(node, onCleanup);
    }
  } else {
    initializeCallbacks.set(node, callback);
  }
};
