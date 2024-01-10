import { type PageInformation, type BehaviorStackData } from '..';

// 错误类型
export enum MechanismType {
  JS = 'js',
  RS = 'resource',
  PM = 'promise',
  HP = 'http',
  CS = 'cors',
}

// 格式化后的 错误数据结构体
export interface ErrorData {
  errorUid: string;
  mechanismType: MechanismType;
  type: string;
  errorMessage?: string;
  meta: Record<string, any>;
  errorStack?: ErrorStackData[];
  hehaviorStack?: BehaviorStackData[];
  pageInformation?: PageInformation;
}

export interface ErrorStackData {
  fileName?: string;
  functionName?: string;
  row?: number;
  col?: number;
}

export interface ErrorOptions {
  js?: boolean;
  resource?: boolean;
  promise?: boolean;
  http?: boolean;
  cors?: boolean;
}
