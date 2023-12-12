import { type PerformanceEntryHandler } from '@/types/performance';

export function observe(type: string, callback: PerformanceEntryHandler) {
  if (PerformanceObserver.supportedEntryTypes.includes(type)) {
    const performanceObserver: PerformanceObserver = new PerformanceObserver((obEntryList) => {
      obEntryList.getEntries().forEach(callback);
    });
    performanceObserver.observe({ type, buffered: true });
    return performanceObserver;
  }
  return undefined;
}
