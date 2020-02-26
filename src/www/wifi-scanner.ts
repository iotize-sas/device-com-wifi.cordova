//
//  Copyright 2019 IoTize SAS Inc.  Licensed under the MIT license. 
//
import { Subject, Observable, Subscriber, BehaviorSubject, from } from 'rxjs';
import { DeviceScanner, DeviceScannerOptions } from '@iotize/device-client.js/scanner/api';
import { CordovaInterface, NetworkType } from './cordova-interface';
import { debug } from './logger';
import { CordovaWifiScanResult } from './definitions';

declare var WifiWizard2: CordovaInterface;

/**
 * 
 */
export class WifiScanner implements DeviceScanner<CordovaWifiScanResult> {

    private _devices$: Subject<CordovaWifiScanResult[]>;
    private _isScanning$ = new BehaviorSubject(false);

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

    /**
     * Launches the scan for BLE devices
     */
    start(options: DeviceScannerOptions = {}): Promise<void> {
        debug("Start Scanning ...");
        WifiWizard2.startScan()
            .then(() => {
                return WifiWizard2.timeout(options.timeout || 5000);
            })
            .then(() => {
                return WifiWizard2.getScanResults();
            })
            .then((scanResults: NetworkType[]) => {
                this._devices$.next(scanResults);
                this._isScanning$.next(false);
            })
            .catch((err) => {
                this._isScanning$.next(false);
                debug('Scan result error', err);
            });
        return Promise.resolve();
    }

    async stop(): Promise<void> {
        debug("Stop Scanning ...");
        await this._cancelScan();
    }

    private async _cancelScan() {
        let scanResults = await WifiWizard2.getScanResults();
        if (this._devices$) {
            this._devices$.next(scanResults);
        }
        this._isScanning$.next(false);
    }
}
