//
//  Copyright 2019 IoTize SAS Inc.  Licensed under the MIT license. 
//
import { promiseTimeout } from '@iotize/common/promise';
import { DeviceScanner, DeviceScannerOptions } from '@iotize/tap/scanner/api';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { CordovaInterface, NetworkType } from './cordova-interface';
import { CordovaWifiScanResult } from './definitions';
import { debug } from './logger';

declare var WifiWizard2: CordovaInterface;

const TAG = 'WifiScannerCordova';

const DEFAULT_STOP_TIMEOUT = 10 * 1000;
/**
 * 
 */
export class WifiScanner implements DeviceScanner<CordovaWifiScanResult> {

    private _devices$: Subject<CordovaWifiScanResult[]>;
    private _isScanning$ = new BehaviorSubject(false);
    private _scanPromise?: Promise<any>;

    constructor() {
        this._devices$ = new Subject();
    }

    public get scanning(): Observable<boolean> {
        return this._isScanning$.asObservable();
    }

    public get isScanning(): boolean {
        return this._isScanning$.value;
    }

    get results(): Observable<CordovaWifiScanResult[]> {
        return this._devices$.asObservable();
    }

    isAvailable(): Promise<boolean>{
        return WifiWizard2.isWifiEnabled();
    }

    /**
     * Launches the scan for BLE devices
     */
    async start(options: DeviceScannerOptions = {}): Promise<void> {
        // if (!await this.isAvailable()){
        //     throw new Error(`WiFi is not available. Please enabled Wi-Fi to start scan`);
        // }
        if (this.isScanning) {
            debug(TAG, 'Already scanning');
            return;
        }
        debug(TAG, "Start Scanning ...");
        this._isScanning$.next(true);
        this._scanPromise = WifiWizard2.scan()
            // .then(() => {
            //     const timeout = options.timeout || 5000;
            //     debug(TAG, `Waiting for ${timeout}ms...`);
            //     return WifiWizard2.timeout(timeout);
            // })
            // .then(() => {
            //     debug(TAG, 'Getting scan results...');
            //     return WifiWizard2.getScanResults();
            // })
            .then((scanResults: NetworkType[]) => {
                this._devices$.next(scanResults);
                debug(TAG, 'Scanner stopped', scanResults);
                this._isScanning$.next(false);
            })
            .catch((err) => {
                this._isScanning$.next(false);
                debug(TAG, 'Scan result error', err);
            });
    }

    async stop(options?: { timeout?: number }): Promise<void> {
        debug(TAG, "Stop Scanning ...");
        return promiseTimeout(
            options?.timeout || DEFAULT_STOP_TIMEOUT,
            this._cancelScan()
        );
    }

    private async _cancelScan() {
        this._isScanning$.next(false);
        try {
            const scanResults = await WifiWizard2.getScanResults();
            if (this._devices$) {
                this._devices$.next(scanResults);
            }
        }
        catch (err) {
            // we can ignore if getScanResults has errors
        }
    }
}
