export function trackRouterChange(handler: (...args: any[]) => any) {
  window.addEventListener('pushState', (e) => handler(e), true);
  window.addEventListener('replaceState', (e) => handler(e), true);
  window.addEventListener('popstate', (e) => handler(e), true);
}
