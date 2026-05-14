declare module "auto-launch" {
  class AutoLaunch {
    constructor(options: {
      name: string;
      path: string;
      isHidden?: boolean;
      extraArgs?: string[];
    });
    enable(): Promise<void>;
    disable(): Promise<void>;
    isEnabled(): Promise<boolean>;
  }
  export = AutoLaunch;
}
