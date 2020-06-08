export interface ServiceType {
    domain: string,
    type: string,
    name: string | null,
    port: number,
    hostname: string,
    ipv4Addresses: string[],
    ipv6Addresses?: string[],
    txtRecord?: Record<string, any>,
    [key: string]: any
}

type ErrorCallback = (err: Error) => void;

export interface ZeroConf {
    reInit(success?: () => void, error?: ErrorCallback): void;
    unwatch(type: string, domain: string, success?: () => void, error?: ErrorCallback): void;
    watch(type: string, domain: string, callack: (result: WatchResultType) => void): void;
    close(success?: () => void, failure?: ErrorCallback): void;
    getHostname(callback: (callback: string) => void): void;
}

export interface WatchResultType {
    action: 'added' | 'resolved' | string,
    service: ServiceType
}