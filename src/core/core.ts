import { ErrorTracker } from '@/error';
import { PerformanceTracker } from '@/performance';
import { TrackerConfig, type Options } from '@/types';
import { UserActionTracker } from '@/userAction';
import { formatDate } from '@/utils/formatDate';

export class Tracker {
  public appId: string;
  public uid?: string;
  public extra?: Record<string, any>;
  public options: Options;

  public performanceTracker?: PerformanceTracker;
  public userActionTracker?: UserActionTracker;
  public errorTracker?: ErrorTracker;

  public constructor(appId: string, options?: Options) {
    this.appId = appId;
    this.options = Object.assign(
      {
        sdkVersion: TrackerConfig.version,
        requestUrl: 'http://localhost:3000',
        performanceTracker: true,
        userActionTracker: true,
        errorTracker: true,
      },
      options,
    );
    (window as any).ziMuSetUserId = this.setUserId.bind(this);
    (window as any).ziMuSetExtra = this.setExtra.bind(this);
    this.installInnerTracker();
  }

  private installInnerTracker() {
    if (this.options.performanceTracker) {
      this.performanceTracker = new PerformanceTracker(
        this.options.performanceTracker,
        this.report.bind(this),
      );
    }
    if (this.options.userActionTracker) {
      this.userActionTracker = new UserActionTracker(
        this.options.userActionTracker,
        this.report.bind(this),
      );
    }
    if (this.options.errorTracker) {
      this.errorTracker = new ErrorTracker(this.options.errorTracker, this.report.bind(this), this);
    }
  }

  public report<T extends Record<string, any>>(data: T, type: string) {
    const params = Object.assign(
      { data, type },
      {
        appId: this.appId,
        uid: this.uid,
        extra: this.extra,
        time: new Date().getTime(),
        timeFormat: formatDate(new Date()),
      },
    );
    const blob = new Blob([JSON.stringify(params)]);
    navigator.sendBeacon(this.options.requestUrl as string, blob);
  }

  private setUserId(uid: string) {
    this.uid = uid;
  }

  private setExtra(extra: Record<string, any>) {
    this.extra = extra;
  }
}
