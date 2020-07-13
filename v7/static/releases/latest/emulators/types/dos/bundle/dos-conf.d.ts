export declare type DosConfigValue = string | number | boolean;
export interface DosConfigOption {
    name: string;
    description: string;
    value: DosConfigValue;
    allowedValues: DosConfigValue[];
}
export declare type DosCategoryOptions = {
    [name: string]: DosConfigOption;
};
export interface DosConfigCategory {
    name: string;
    description: string;
    options: DosCategoryOptions;
}
export declare class OutputCategory implements DosConfigCategory {
    name: string;
    description: string;
    options: {
        autolock: {
            name: string;
            description: string;
            value: boolean;
            allowedValues: boolean[];
        };
    };
}
export declare class DosboxCategory implements DosConfigCategory {
    name: string;
    description: string;
    options: {
        machine: {
            name: string;
            description: string;
            value: string;
            allowedValues: string[];
        };
    };
}
export declare class CpuCategory implements DosConfigCategory {
    name: string;
    description: string;
    options: {
        core: {
            name: string;
            description: string;
            value: string;
            allowedValues: string[];
        };
        cputype: {
            name: string;
            description: string;
            value: string;
            allowedValues: string[];
        };
        cycles: {
            name: string;
            description: string;
            value: string;
            allowedValues: string[];
        };
    };
}
export declare class MixerCategory implements DosConfigCategory {
    name: string;
    description: string;
    options: {
        rate: {
            name: string;
            description: string;
            value: number;
            allowedValues: any[];
        };
        nosound: {
            name: string;
            description: string;
            value: boolean;
            allowedValues: boolean[];
        };
    };
}
export declare class AutoexecCategory implements DosConfigCategory {
    name: string;
    description: string;
    options: {
        script: {
            name: string;
            description: string;
            value: string;
            allowedValues: any[];
        };
    };
}
export interface DosConfig {
    output: OutputCategory;
    dosbox: DosboxCategory;
    cpu: CpuCategory;
    mixer: MixerCategory;
    autoexec: AutoexecCategory;
}
export declare function createDosConfig(): DosConfig;
export declare function toDosboxConf(config: DosConfig): Promise<string>;
