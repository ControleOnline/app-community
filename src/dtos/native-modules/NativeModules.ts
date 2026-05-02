import type {IPayment} from './PaymentModule';
import type {IBackgroundRuntime} from './BackgroundRuntimeModule';

interface NativeModules {
  Payment: IPayment;
  BackgroundRuntime?: IBackgroundRuntime;
}

export type {NativeModules};
