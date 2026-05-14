interface IBackgroundRuntime {
  syncRegistration: (json: string) => Promise<string>;
  clearRegistration: (registrationId?: string) => Promise<string>;
}

export type {IBackgroundRuntime};
