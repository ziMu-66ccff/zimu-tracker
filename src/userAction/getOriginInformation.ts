import { type OriginInformation } from '@/types';

export function getOriginInformation(): OriginInformation {
  return {
    referrer: document.referrer,
    type: performance.getEntriesByType('navigation')[0].type,
  };
}
