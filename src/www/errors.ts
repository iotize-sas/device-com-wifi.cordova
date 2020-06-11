import { WifiComProtocolOptionsNetwork } from './definitions';

export class WifiComProtocolError extends Error {

    static wifiNotEnabled(network: WifiComProtocolOptionsNetwork) {
        return new WifiComProtocolError(
            WifiComProtocolError.Code.WifiNotEnabled,
            `WiFi is not enabled. Cannot connect to network "${network.SSID}"`
        );
    }
    
    static connectFailedTimeout(network: WifiComProtocolOptionsNetwork) {
        return new WifiComProtocolError(
            WifiComProtocolError.Code.ConnectFailedTimeout,
            `Connection to "${network.SSID}" timeout`
        );
    }

    public static cannotConnectToNetwork(network: WifiComProtocolOptionsNetwork) {
        return new WifiComProtocolError(
            WifiComProtocolError.Code.CannotConnectToNetwork,
            `Cannot connect Wi-Fi network "${network.SSID}"`
        );
    }

    public static unknownError(err: Error, network?: WifiComProtocolOptionsNetwork) {
        return new WifiComProtocolError(
            WifiComProtocolError.Code.UnknownError,
            err.message || `Unknown Wi-Fi protocol error`,
            err
        );
    }

    constructor(public code: WifiComProtocolError.Code, msg: string, public cause?: Error) {
        super(msg);
    }
}

export namespace WifiComProtocolError {
    export enum Code {
        CannotConnectToNetwork = 'WifiComProtocolErrorCannotConnectToNetwork',
        ConnectFailedTimeout = 'WifiComProtocolErrorConnectFailedTimeout',
        UnknownError = 'WifiComProtocolErrorUnknown',
        WifiNotEnabled = "WifiComProtocolErrorWifiNotEnabled"
    }
}