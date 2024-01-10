import { type Tracker } from '@/core';
import { type UserActionOptions, type PerformanceOptions, type ErrorOptions } from '..';

/**
 * @param sdkVersion sdk版本
 * @param requestUrl 上报数据的接口地址
 * @param userActionTracker 用户行为上报
 * @param performanceTracker: 性能数据上报
 */

export interface Options {
  sdkVersion: string | number;
  requestUrl: string;
  userActionTracker: boolean | UserActionOptions;
  performanceTracker: boolean | PerformanceOptions;
  errorTracker: boolean | ErrorOptions;
}

export enum TrackerConfig {
  version = '1.0.0',
}

export type Report = Tracker['report'];
