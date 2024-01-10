import { type UserActionMetricsName } from '.';

export interface BehaviorRecordsOptions {
  maxBehaviorRecords: number;
}

export interface BehaviorStackData {
  name: UserActionMetricsName | string;
  page: string;
  value: Record<string, any>;
  time: number | string;
  timeFormat: string;
}
