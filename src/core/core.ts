import { MouseEventList } from '@/const';
import { PerformanceTracker } from '@/performance';
import { TrackerConfig, type Options } from '@/types';
import { createHistoryEvent } from '@/utils';
import { formatDate } from '@/utils/formatDate';

export class Tracker {
  public appId: string;
  public uid?: string;
  public extra?: Record<string, any>;
  public options: Options;

  public constructor(appId: string, options?: Options) {
    this.appId = appId;
    this.options = Object.assign(this.initDefaultOptions(), options);
    this.installInnerTracker();
  }

  private initDefaultOptions(): Options {
    window.history.pushState = createHistoryEvent('pushState');
    window.history.replaceState = createHistoryEvent('replaceState');

    return {
      sdkVersion: TrackerConfig.version,
      requestUrl: 'http://localhost:3000',
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      errorTracker: false,
      performanceTracker: true,
    };
  }

  private installInnerTracker() {
    if (this.options.historyTracker) {
      this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv');
    }
    if (this.options.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv');
    }
    if (this.options.domTracker) {
      this.captureDomTargetKey();
    }
    if (this.options.errorTracker) {
      this.captureError();
    }
    if (this.options.performanceTracker) {
      new PerformanceTracker(this.report.bind(this));
    }
  }

  private captureEvents<T>(EventList: string[], targetKey: string, data?: T) {
    EventList.forEach((event) => {
      window.addEventListener(event, () => {
        this.report({ event, targetKey, ...data });
      });
    });
  }

  private captureDomTargetKey() {
    MouseEventList.forEach((event) => {
      window.addEventListener(event, (e) => {
        const element = e.target as HTMLElement;
        const targetValue = element.getAttribute('target-key');
        if (targetValue) {
          this.report({ event, targetKey: targetValue });
        }
      });
    });
  }

  private captureError() {
    window.addEventListener('error', (e) => {
      this.report({ event: 'error', targetKey: 'error message', message: e.message });
    });
    window.addEventListener('unhandledrejection', (e) => {
      e.promise.catch((error) => {
        this.report({
          event: 'promise reject',
          targetKey: 'reject message',
          message: error,
        });
      });
    });
  }

  public report<T extends Record<string, any>>(data: T) {
    const params = Object.assign(data, {
      appId: this.appId,
      uid: this.uid,
      extra: this.extra,
      time: new Date().getTime(),
      timeFormat: formatDate(new Date()),
    });
    const blob = new Blob([JSON.stringify(params)]);
    navigator.sendBeacon(this.options.requestUrl as string, blob);
  }

  public setUserId(uid: string) {
    this.uid = uid;
  }

  public setExtra(extra: Record<string, any>) {
    this.extra = extra;
  }
}
