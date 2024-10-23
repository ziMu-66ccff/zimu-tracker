import { type Report } from '@/types';
import {
  PerformanceMetricsName,
  type ResourceFlowTiming,
  type PerformanceOptions,
} from '@/types/performance';
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
import { getNavigationTiming } from './getNavigationTiming';
import { afterLoad } from '@/utils/afterLoad';
import { getResourceFlow } from './getResourceFlow';
import { getCacheData } from './getCacheData';

export class PerformanceTracker {
  private readonly data: Record<PerformanceMetricsName | string, Record<string, any>>;
  private readonly options: PerformanceOptions;
  private readonly report: Report;

  constructor(options: true | PerformanceOptions, report: Report) {
    this.data = {};
    this.options = Object.assign(
      {
        FCP: true,
        LCP: true,
        FID: true,
        CLS: true,
        navigationTiming: true,
        resourceFlow: true,
        cacheData: true,
      },
      options,
    );
    this.report = report;
    this.installPerformanceInnerTracker();
    this.performanceDataReportHandler();
  }

  private initFCP() {
    onFCP((metricData: FCPMetric) => {
      this.data[PerformanceMetricsName.FCP] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initLCP() {
    onLCP((metricData: LCPMetric) => {
      this.data[PerformanceMetricsName.LCP] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initFID() {
    onFID((metricData: FIDMetric) => {
      this.data[PerformanceMetricsName.FID] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initCLS() {
    onCLS((metricData: CLSMetric) => {
      this.data[PerformanceMetricsName.CLS] = {
        name: metricData.name,
        value: metricData.value,
        rating: metricData.rating,
      };
    });
  }

  private initNavigationTiming() {
    const navigationTiming = getNavigationTiming();
    this.data[PerformanceMetricsName.NT] = navigationTiming;
  }

  private initResourceFlow() {
    const resouceFlow: ResourceFlowTiming[] = getResourceFlow();
    this.data[PerformanceMetricsName.RF] = resouceFlow;
  }

  private initCacheData() {
    const cacheData = getCacheData();
    this.data[PerformanceMetricsName.CD] = cacheData;
  }

  private installPerformanceInnerTracker() {
    if (this.options.FCP) this.initFCP();
    if (this.options.LCP) this.initLCP();
    if (this.options.FID) this.initFID();
    if (this.options.CLS) this.initCLS();

    afterLoad(() => {
      if (this.options.navigationTiming) this.initNavigationTiming();
      if (this.options.resourceFlow) this.initResourceFlow();
      if (this.options.cacheData) this.initCacheData();
    });
  }

  private performanceDataReportHandler() {
    window.addEventListener('beforeunload', () => {
      if (this.data[PerformanceMetricsName.FID]) {
        this.report(this.data, 'performance');
      }
    });
  }
}
