import { type Tracker } from '@/core';

/**
 * @param sdkVersion sdk版本
 * @param requestUrl 上报数据的接口地址
 * @param historyTracker history上报
 * @param hashTracker hash上报
 * @param domTracker 携带Tracker-key dom元素的各种事件事件上报
 * @param errorTracker js 和 promise 报错异常上报
 */

export interface Options {
  sdkVersion: string | number;
  requestUrl: string;
  historyTracker: boolean;
  hashTracker: boolean;
  domTracker: boolean;
  errorTracker: boolean;
  performanceTracker: boolean;
}

export interface reportTrackerData {
  [key: string]: any;
  event: string;
  targetKey: string;
}

export enum TrackerConfig {
  version = '1.0.0',
}

export type Report = Tracker['report'];
