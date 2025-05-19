export function writePushStateAndReplaceState() {
  history.pushState = writeHistoryEvent('pushState');
  history.replaceState = writeHistoryEvent('replaceState');
}

function writeHistoryEvent(type: keyof History) {
  const originEvent = history[type];
  return function () {
    const result = originEvent.apply(history, arguments);
    const event = new Event(type);
    window.dispatchEvent(event);
    return result;
  };
}
