import { type ResourceFlowTiming } from '@/types/performance';
// import { observe } from './observe';

// export function getResourceFlow(resourceFlow: ResourceFlowTiming[]) {
//   const entryHandler = (entry: PerformanceResourceTiming) => {
//     const {
//       name,
//       transferSize,
//       initiatorType,
//       startTime,
//       responseEnd,
//       domainLookupEnd,
//       domainLookupStart,
//       connectStart,
//       connectEnd,
//       secureConnectionStart,
//       responseStart,
//       requestStart,
//     } = entry;

//     resourceFlow.push({
//       name,
//       initiatorType,
//       transferSize,
//       start: startTime,
//       end: responseEnd,
//       DNS: domainLookupEnd - domainLookupStart,
//       TCP: connectEnd - connectStart,
//       SSL: connectEnd - secureConnectionStart,
//       TTFB: responseStart - requestStart,
//       Trans: responseEnd - requestStart,
//     });
//   };
//   return observe('resource', entryHandler);
// }

export function getResourceFlow(): ResourceFlowTiming[] {
  const resouceDatas = performance.getEntriesByType('resource');
  return resouceDatas.map((resourceData) => {
    const {
      name,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
      domainLookupEnd,
      domainLookupStart,
      connectStart,
      connectEnd,
      secureConnectionStart,
      responseStart,
      requestStart,
    } = resourceData;

    return {
      name,
      initiatorType,
      transferSize,
      start: startTime,
      end: responseEnd,
      DNS: domainLookupEnd - domainLookupStart,
      TCP: connectEnd - connectStart,
      SSL: connectEnd - secureConnectionStart,
      TTFB: responseStart - requestStart,
      Trans: responseEnd - requestStart,
    };
  });
}
