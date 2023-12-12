export function createHistoryEvent<T extends keyof History>(type: T) {
  const originHistoryEvent = history[type];
  return function (this: any) {
    const res = originHistoryEvent.apply(this, arguments);
    const event = new Event(type);
    window.dispatchEvent(event);
    return res;
  };
}
