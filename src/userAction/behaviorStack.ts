import { type BehaviorRecordsOptions, type BehaviorStackData } from '@/types';

export class BehaviorStack {
  private data: BehaviorStackData[];
  private readonly maxBehaviorRecords: number;

  constructor(options: BehaviorRecordsOptions) {
    const { maxBehaviorRecords } = options;
    this.maxBehaviorRecords = maxBehaviorRecords;
    this.data = [];
  }

  push(value: BehaviorStackData) {
    if (this.length() === this.maxBehaviorRecords) {
      this.shift();
    }
    this.data.push(value);
  }

  shift() {
    return this.data.shift();
  }

  length() {
    return this.data.length;
  }

  get() {
    return this.data;
  }

  clear() {
    this.data = [];
  }
}
