import {
  type Report,
  type ErrorOptions,
  type ErrorData,
  MechanismType,
  type HttpMetrics,
} from '@/types';
import { type Tracker } from '..';
import { getErrorKey } from './getErrorKey';
import { getErrorUid } from '../utils/getErrorUid';
import { parseErrorStackFrames } from './parserErrorStack';
import { getPageInformation } from '@/userAction/getPageInformation';
import { proxyXmlHttp } from '@/userAction/proxyXmlHttp';
import { proxyFetch } from '@/userAction/proxyFetch';

export class ErrorTracker {
  private readonly options: ErrorOptions;
  private readonly submitErrorUids: string[];
  private readonly report: Report;
  private readonly trackerInstance: Tracker;

  constructor(options: true | ErrorOptions, report: Report, trackerInstance: Tracker) {
    this.options = Object.assign(
      {
        js: true,
        resource: true,
        promise: true,
        cors: true,
        http: true,
      },
      options,
    );
    this.submitErrorUids = [];
    this.report = report;
    this.trackerInstance = trackerInstance;
    this.installErrorInnerTracker();
  }

  private initJSError() {
    window.addEventListener(
      'error',
      (event) => {
        if (getErrorKey(event) !== MechanismType.JS) return;
        const errorData: ErrorData = {
          errorUid: getErrorUid(`${MechanismType.JS}-${event.message}-${event.filename}`),
          mechanismType: MechanismType.JS,
          type: event.error?.name ?? 'UnKnowun',
          errorMessage: event.message,
          meta: {
            file: event.filename,
            row: event.lineno,
            col: event.colno,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          errorStack: parseErrorStackFrames(event.error),
          hehaviorStack: this.trackerInstance.userActionTracker?.hehaviorStack.get(),
          pageInformation: getPageInformation(),
        };
        this.errorDataReportHandler(errorData);
      },
      true,
    );
  }

  private initResourceError() {
    window.addEventListener(
      'error',
      (event) => {
        if (getErrorKey(event) !== MechanismType.RS) return;
        const target = event.target as HTMLScriptElement;
        const errorData: ErrorData = {
          errorUid: getErrorUid(`${MechanismType.RS}-${target.src}-${target.tagName}`),
          mechanismType: MechanismType.RS,
          type: 'RessourceError',
          errorMessage: '',
          meta: {
            url: target.src,
            html: target.outerHTML,
            type: target.tagName,
          },
          hehaviorStack: this.trackerInstance.userActionTracker?.hehaviorStack.get(),
          pageInformation: getPageInformation(),
        };
        this.errorDataReportHandler(errorData);
      },
      true,
    );
  }

  private initPromiseError() {
    window.addEventListener(
      'unhandledrejection',
      (event) => {
        const errorData: ErrorData = {
          errorUid: getErrorUid(
            `${MechanismType.PM}-${event.reason.message ?? event.reason}-${
              event.reason.name ?? 'UnKnown'
            }`,
          ),
          mechanismType: MechanismType.PM,
          type: event.reason?.name ?? 'UnKnown',
          errorMessage: event.reason?.message ?? event.reason,
          meta: {},
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          errorStack: parseErrorStackFrames(event.reason),
          hehaviorStack: this.trackerInstance.userActionTracker?.hehaviorStack.get(),
          pageInformation: getPageInformation(),
        };
        this.errorDataReportHandler(errorData);
      },
      true,
    );
  }

  private initHttpError() {
    const loadHandler = (metrics: HttpMetrics) => {
      if (metrics.status < 400) return;
      const errorData: ErrorData = {
        errorUid: getErrorUid(`${MechanismType.HP}-${metrics.response}-${metrics.statusText}`),
        mechanismType: MechanismType.HP,
        type: 'HTTPError',
        errorMessage: metrics.response,
        meta: {
          ...metrics,
        },
        hehaviorStack: this.trackerInstance.userActionTracker?.hehaviorStack.get(),
        pageInformation: getPageInformation(),
      };
      this.errorDataReportHandler(errorData);
    };
    proxyXmlHttp(loadHandler);
    proxyFetch(loadHandler);
  }

  private initCorsError() {
    window.addEventListener(
      'error',
      (event) => {
        if (getErrorKey(event) !== MechanismType.CS) return;
        const errorData: ErrorData = {
          errorUid: getErrorUid(`${MechanismType.CS}-${event.message}`),
          mechanismType: MechanismType.CS,
          type: 'CorsError',
          errorMessage: event.message,
          meta: {},
          hehaviorStack: this.trackerInstance.userActionTracker?.hehaviorStack.get(),
          pageInformation: getPageInformation(),
        };
        this.errorDataReportHandler(errorData);
      },
      true,
    );
  }

  private installErrorInnerTracker() {
    if (this.options.js) this.initJSError();
    if (this.options.resource) this.initResourceError();
    if (this.options.promise) this.initPromiseError();
    if (this.options.http) this.initHttpError();
    if (this.options.cors) this.initCorsError();
  }

  private errorDataReportHandler(errorData: ErrorData) {
    if (this.submitErrorUids.includes(errorData.errorUid as string)) return;
    this.submitErrorUids.push(errorData.errorUid as string);
    this.report(errorData, 'error');
  }
}
