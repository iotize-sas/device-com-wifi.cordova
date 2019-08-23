export interface NetworkType {
    level: number; // raw RSSI value
    SSID: string; // SSID as string, with escaped double quotes: "\"ssid name\""
    BSSID: string; // MAC address of WiFi router as string
    frequency: number; // frequency of the access point channel in MHz
    capabilities: number; // Describes the authentication, key management, and encryption schemes supported by the access point.
    timestamp: number; // timestamp of when the scan was completed
    /**
     * only supported on API > 23 (Marshmallow), any older API will return null for these values
     */
    channelWidth: number | null;
    /**
     * only supported on API > 23 (Marshmallow), any older API will return null for these values
     */
    centerFreq0: number | null;
    /**
     * only supported on API > 23 (Marshmallow), any older API will return null for these values
     */
    centerFreq1: number | null;
}

export interface ScanOptions {
    numLevels?: number | true | false;
}

export interface CordovaInterface {

    // General

    getConnectedSSID(): Promise<string>;

    getConnectedBSSID(): Promise<string>;

    timeout(ms: number): Promise<void>;

    // iOS

    iOSConnectNetwork(ssid: string, ssidPassword: string): void;

    iOSDisconnectNetwork(ssid: string): void;

    // Android 

    /**
     * This method essentially calls formatWifiConfig then add then enable
     * If unable to update network configuration (was added by user or other app), but a valid network ID exists, this method will still attempt to enable the network
     * Promise will not be returned until method has verified that connection to WiFi was in completed state (waits up to 60 seconds)
     * 
     * @param ssid  should be the SSID to connect to required
     * @param bindAll  should be set to true to tell Android to route all connections from your Android app, through the wifi connection (default is false) optional. See WifiWizard2.enable for more details regarding bindAll feature
     * @param password password is not required if connecting to an open network
     * @param algorithm Currently WPA and WEP are only supported algorithms. For WPA2 just pass WPA as the algorithm
     * @param isHiddenSSID Set isHiddenSSID to true if the network you're connecting to is hidden, These arguments are the same as for formatWifiConfig

     */
    connect(ssid: string, bindAll?: boolean, password?: string, algorithm?: string, isHiddenSSID?: boolean): Promise<void>;

    /**
     * @param ssid ssid can either be an SSID (string) or a network ID (integer) ssid is OPTIONAL .. if not passed, will disconnect current WiFi (almost all Android versions now will just automatically reconnect to last wifi after disconnecting)
     * If ssid is provided, this method will first attempt to disable and then remove the network.
     */
    disconnect(ssid?: string | number): Promise<void>;

    formatWifiConfig(ssid: string, password?: string, algorithm?: string, isHiddenSSID?: boolean): Promise<void>;

    formatWPAConfig(ssid: string, password?: string, isHiddenSSID?: boolean): Promise<void>;

    add(wifi: any): Promise<void>;

    remove(ssid: string): Promise<void>;

    listNetworks(): Promise<void>;

    /**
     * Same as calling startScan and then getScanResults, except this method will only resolve the promise after the scan completes and returns the results.
     * 
     */
    scan(options?: ScanOptions): Promise<NetworkType[]>;

    /**
     * It is recommended to just use the scan method instead of startScan
     */
    startScan(): Promise<void>;

    /**
     * getScanResults should only be called after calling startScan (it is recommended to use scan instead as this starts the scan, then returns the results)
     * @param options is optional, if you do not want to specify, just pass success callback as first parameter, and fail callback as second parameter
     *      Retrieves a list of the available networks as an array of objects and passes them to the function listHandler. 
     */
    getScanResults(options?: ScanOptions): Promise<NetworkType[]>;

    /**
     * Returns boolean value of whether Wifi is enabled or not
     */
    isWifiEnabled(): Promise<boolean>;

    /**
     * Pass true for enabled parameter to set Wifi enabled
     * You do not need to call this function to set WiFi enabled to call other methods that require wifi enabled. 
     * This plugin will automagically enable WiFi if a method is called that requires WiFi to be enabled.
     */
    setWifiEnabled(enabled: boolean): Promise<void>;

    /**
     * Returns currently connected network ID in success callback (only if connected), otherwise fail callback will be called
     * @throws GET_CONNECTED_NET_ID_ERROR Unable to determine currently connected network ID (may not be connected)
     */
    getConnectedNetworkID(): Promise<void>;

    // New to 3.1.1+

    resetBindAll(): Promise<void>;

    setBindAll(): Promise<void>;

    canConnectToInternet(): Promise<void>;

    canConnectToRouter(): Promise<void>;

    // New to 3.0.0+

    isConnectedToInternet(): Promise<void>;

    canPingWifiRouter(): Promise<void>;

    enableWifi(): Promise<void>;

    disableWifi(): Promise<void>;

    getWifiIP(): Promise<void>;

    getWifiRouterIP(): Promise<void>;

    getWifiIPInfo(): Promise<void>;

    reconnect(): Promise<void>;

    reassociate(): Promise<void>;

    getSSIDNetworkID(ssid: string): Promise<number>;

    disable(ssid: string): Promise<void>;

}