import { NetworkType } from "./cordova-interface";
import { ServiceType } from "./service-discovery/cordova-interface";

export type CordovaWifiScanResult = NetworkType;

export type CordovaNetworkScanResult = ServiceType & { host: string | undefined }; 

export interface WifiComProtocolOptions {
    socket: {
        url: string
    },
    network?: {
        SSID: string,
        password?: string,
        algorithm?: string,
        hidden?: boolean
    }
}
