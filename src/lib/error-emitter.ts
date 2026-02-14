
import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We need to declare the `on` and `emit` methods with the correct types
// because the base EventEmitter types are not specific enough.
declare interface AppEventEmitter {
  on<E extends keyof AppEvents>(event: E, listener: AppEvents[E]): this;
  emit<E extends keyof AppEvents>(
    event: E,
    ...args: Parameters<AppEvents[E]>
  ): boolean;
}

class AppEventEmitter extends EventEmitter {}

export const errorEmitter = new AppEventEmitter();
