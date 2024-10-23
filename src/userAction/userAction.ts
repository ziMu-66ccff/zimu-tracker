import {
  UserActionMetricsName,
  type Report,
  type UserActionOptions,
  type HttpMetrics,
} from '@/types';
import { getPageInformation } from './getPageInformation';
import { trackRouterChange } from './trackRouterChange';
import { formatDate } from '@/utils/formatDate';
import { writePushStateAndReplaceState } from './writePushStateAndReplaceState';
import { BehaviorStack } from './behaviorStack';
import { afterLoad } from '@/utils';
import { getOriginInformation } from './getOriginInformation';
import { proxyXmlHttp } from './proxyXmlHttp';
import { proxyFetch } from './proxyFetch';

export class UserActionTracker {
  private readonly data: Record<UserActionMetricsName | string, Record<string, any>>;
  private readonly options: UserActionOptions;
  private readonly elementTrackedList: string[];
  private readonly classTrackedList: string[];
  private readonly eventTrackedList: string[];
  public readonly hehaviorStack: BehaviorStack;
  private readonly report: Report;

  constructor(options: true | UserActionOptions, report: Report) {
    this.data = {};
    this.options = Object.assign(
      {
        PI: true,
        OI: true,
        RCR: true,
        DBR: true,
        HT: true,
        BS: true,
        PV: true,
        elementTrackedList: ['button', 'div'],
        classTrackedList: ['tracked'],
        eventTrackedList: ['click'],
        maxBehaviorRecords: 100,
      },
      options,
    );
    this.elementTrackedList = this.options.elementTrackedList!;
    this.classTrackedList = this.options.classTrackedList!;
    this.eventTrackedList = this.options.eventTrackedList!;
    this.hehaviorStack = new BehaviorStack({
      maxBehaviorRecords: this.options.maxBehaviorRecords!,
    });
    this.report = report;
    writePushStateAndReplaceState();
    (window as any).ziMuSendData = this.sendDataCustom.bind(this);
    this.installUserActionInnerTracker();
    this.userActionDataReportHandler();
  }

  private initPageInformation() {
    const pageInformation = getPageInformation();
    this.data[UserActionMetricsName.PI] = pageInformation;
  }

  private initOriginInformation() {
    const originInformation = getOriginInformation();
    this.data[UserActionMetricsName.OI] = originInformation;
  }

  private initRouterChange() {
    trackRouterChange((e: Event) => {
      const routerChangeData = {
        jumpType: e.type,
        pageInfo: getPageInformation(),
        time: new Date().getTime(),
        timeFormat: formatDate(new Date()),
      };
      if (this.data[UserActionMetricsName.RCR])
        this.data[UserActionMetricsName.RCR].push(routerChangeData);
      else this.data[UserActionMetricsName.RCR] = [routerChangeData];

      const hehaviorStackData = {
        name: UserActionMetricsName.RCR,
        page: getPageInformation().pathname,
        value: {
          jumpType: e.type,
        },
        time: new Date().getTime(),
        timeFormat: formatDate(new Date()),
      };
      this.hehaviorStack.push(hehaviorStackData);
    });
  }

  private initPV() {
    const handler = () => {
      const PVData = {
        pageInfo: getPageInformation(),
        originInformation: getOriginInformation(),
      };
      this.report(PVData, 'PV');
    };
    afterLoad(handler);
    trackRouterChange(handler);
  }

  private initDomHandler() {
    this.eventTrackedList.forEach((eventName) => {
      window.addEventListener(
        eventName,
        (event) => {
          let target = this.elementTrackedList.includes(
            (event.target as HTMLElement)?.tagName?.toLocaleLowerCase(),
          )
            ? (event.target as HTMLElement)
            : undefined;
          target =
            target ??
            Array.from((event.target as HTMLElement)?.classList).find((className) =>
              this.classTrackedList.includes(className),
            )
              ? (event.target as HTMLElement)
              : undefined;

          if (!target) return;

          const domData = {
            tagInfo: {
              id: target.id,
              classList: Array.from(target.classList),
              tagName: target.tagName,
              text: target.textContent,
            },
            pageInfo: getPageInformation(),
            time: new Date().getTime(),
            timeFormat: formatDate(new Date()),
          };

          if (!this.data[UserActionMetricsName.DBR]) {
            this.data[UserActionMetricsName.DBR] = { [eventName]: [domData] };
          } else if (!this.data[UserActionMetricsName.DBR][eventName]) {
            this.data[UserActionMetricsName.DBR][eventName] = [domData];
          } else {
            this.data[UserActionMetricsName.DBR][eventName].push(domData);
          }

          const hehaviorStackData = {
            name: eventName,
            page: getPageInformation().pathname,
            value: {
              tagInfo: {
                id: target.id,
                classList: Array.from(target.classList),
                tagName: target.tagName,
                text: target.textContent,
              },
              pageInfo: getPageInformation(),
            },
            time: new Date().getTime(),
            timeFormat: formatDate(new Date()),
          };
          this.hehaviorStack.push(hehaviorStackData);
        },
        true,
      );
    });
  }

  private initHttpHandler() {
    const loadHandler = (httpMetrics: HttpMetrics) => {
      if (!this.data[UserActionMetricsName.HT]) {
        this.data[UserActionMetricsName.HT] = [httpMetrics];
      } else {
        this.data[UserActionMetricsName.HT].push(httpMetrics);
      }
    };
    proxyXmlHttp(loadHandler);
    proxyFetch(loadHandler);
  }

  private sendDataCustom(data: Record<string, any>) {
    this.report(data, 'custom');
    this.hehaviorStack.push({
      name: 'custom',
      page: getPageInformation().pathname,
      value: data,
      time: new Date().getTime(),
      timeFormat: formatDate(new Date()),
    });
  }

  installUserActionInnerTracker() {
    if (this.options.PI) this.initPageInformation();
    if (this.options.OI) this.initOriginInformation();
    if (this.options.RCR) this.initRouterChange();
    if (this.options.DBR) this.initDomHandler();
    if (this.options.PV) this.initPV();
    if (this.options.HT) this.initHttpHandler();
  }

  private userActionDataReportHandler() {
    window.addEventListener('beforeunload', () => {
      this.report(this.data, 'userAction');
      if (this.options.BS) this.report(this.hehaviorStack.get(), 'behaviorStack');
    });
  }
}
