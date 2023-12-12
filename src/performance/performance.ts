import { type Report } from '@/types';
import { type ResourceFlowTiming, metricsName } from '@/types/performance';
import {
  onFCP,
  onCLS,
  onLCP,
  onFID,
  type FCPMetric,
  type LCPMetric,
  type FIDMetric,
  type CLSMetric,
} from 'web-vitals';
import { getNavigationTiming } from './getNT';
import { afterLoad } from '@/utils/afterLoad';
import { getResourceFlow } from './getRF';
import { getCacheData } from './getCD';

export class PerformanceTracker {
  private readonly data: Record<metricsName | string, Record<string, any>>;
  private readonly report: Report;

  constructor(report: Report) {
    this.data = {};
    this.report = report;
    this.initFCP();
    this.initLCP();
    this.initFID();
    this.initCLS();
    afterLoad(() => {
      this.initNavigationTiming();
      this.initResourceFlow();
      this.initCacheData();
    });
    this.performanceDataReportHandler();
  }

  private initFCP() {
    onFCP((metricData: FCPMetric) => {
      this.data[metricsName.FCP] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initLCP() {
    onLCP((metricData: LCPMetric) => {
      this.data[metricsName.LCP] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initFID() {
    onFID((metricData: FIDMetric) => {
      this.data[metricsName.FID] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initCLS() {
    onCLS((metricData: CLSMetric) => {
      this.data[metricsName.CLS] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initNavigationTiming() {
    const navigationTiming = getNavigationTiming();
    this.data[metricsName.NT] = navigationTiming;
  }

  private initResourceFlow() {
    // const resouceFlow: ResourceFlowTiming[] = [];
    // const resouceObserver = getResourceFlow(resouceFlow);

    // const stopListeningAndInitRF = () => {
    //   if (resouceObserver) resouceObserver.disconnect();
    //   this.data[metricsName.RF] = resouceFlow;
    // };

    // afterLoad(stopListeningAndInitRF);

    const resouceFlow: ResourceFlowTiming[] = getResourceFlow();
    this.data[metricsName.RF] = resouceFlow;
  }

  private initCacheData() {
    const cacheData = getCacheData();
    this.data[metricsName.CD] = cacheData;
  }

  private performanceDataReportHandler() {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report(this.data);
      }
    });
  }
}
