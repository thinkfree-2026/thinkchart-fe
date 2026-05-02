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

const containsNode = (target: Node, node: Node) => {
  return target === node || target.contains(node);
};

const observer = new MutationObserver(mutations => {
  if (initializeCallbacks.size === 0 && cleanupCallbacks.size === 0) return;

  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(addedNode => {
      initializeCallbacks.forEach((initializeCallback, targetNode) => {
        if (targetNode.isConnected && containsNode(addedNode, targetNode)) {
          const onCleanup = initializeCallback(targetNode); // Initialize 콜백 함수 실행

          if (typeof onCleanup === 'function') {
            cleanupCallbacks.set(targetNode, onCleanup);
          }

          initializeCallbacks.delete(targetNode);
        }
      });
    });

    mutation.removedNodes.forEach(removedNode => {
      cleanupCallbacks.forEach((cleanupCallback, targetNode) => {
        if (!targetNode.isConnected && containsNode(removedNode, targetNode)) {
          cleanupCallback(); // Cleanup 콜백 함수 실행
          cleanupCallbacks.delete(targetNode);
        }
      });
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
