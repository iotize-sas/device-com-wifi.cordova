import { DeviceScanner, DeviceScannerOptions } from '@iotize/tap/scanner/api';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { CordovaNetworkScanResult } from '../definitions';
import { debug } from '../logger';
import { ServiceType, ZeroConf } from './cordova-interface';

declare var cordova: any | undefined;

const TAG = 'ZeroConfScannerCordova';

const DEFAULT_STOP_TIMEOUT = 10 * 1000;
export class ZeroConfScannerCordova implements DeviceScanner<CordovaNetworkScanResult> {
    // _hostname: string;
    private _services: CordovaNetworkScanResult[] = [];
    private _services$ = new Subject<CordovaNetworkScanResult[]>();
    private _isRunning = new BehaviorSubject<boolean>(false);
    private zeroconf: ZeroConf;

    constructor(public readonly options = {
        domain: 'local.',
        type: '_tapm2m._tcp.'
    }) {
        if (typeof cordova !== undefined && cordova && cordova.plugins) {
            this.zeroconf = cordova.plugins.zeroconf;
        }
        else {
            throw new Error(`Cordova plugin zeroconf is missing`);
        }
    }

    get results(): Observable<CordovaNetworkScanResult[]> {
        return this._services$.asObservable();
    }

    get scanning(): Observable<boolean> {
        return this._isRunning.asObservable();
    }

    get isScanning(): boolean {
        return this._isRunning.value;
    }

    set type(type: string) {
        this.options.type = type;
    }

    set domain(domain: string) {
        this.options.domain = domain;
    }

    /**
     * Start scan
     */
    start(option?: DeviceScannerOptions): Promise<void> {
        debug(TAG, 'start');
        this.init();
        return this._start();
    }

    /**
     * Stop with timeout
     */
    async stop(options?: { timeout?: number }): Promise<void> {
        this.unwatch().catch(err => { });
        this.zeroconf.close();
        this._isRunning.next(false);
        // Zeroconf callback are never called
        // return promiseTimeout(options?.timeout || DEFAULT_STOP_TIMEOUT, new Promise<void>((resolve, reject) => {
        //     debug(TAG, 'stoping...', this.options);
        //     this.zeroconf.close(() => {
        //         debug(TAG, 'stopped');
        //         this._isRunning.next(false);
        //         resolve();
        //     }, (err) => {
        //         debug(TAG, 'stop error', err);
        //         reject(err);
        //     });
        // }))
        //     .catch(err => {
        //         this._isRunning.next(false);
        //         throw err;
        //     });
    }

    /**
     * Initialize/reinitialize scanner
     */
    init() {
        debug(TAG, 'init zero conf...');
        this.zeroconf.reInit();
    }

    private unwatch(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            debug(TAG, 'unwatching...');
            this.zeroconf.unwatch(
                this.options.type
                , this.options.domain
                , () => {
                    debug(TAG, 'unwatch stop', this.options);
                    resolve();
                }, (err) => {
                    debug(TAG, 'unwatch error', this.options, err);
                    reject(err);
                });
        });
    }

    getHostname(): Promise<string> {
        return new Promise((resolve) => {
            this.zeroconf.getHostname((hostname: string) => {
                resolve(hostname);
            });
        })
    }

    private async _start(): Promise<any> {
        try {
            // if (!this._hostname) {
            //     this._hostname = await this.getHostname();
            // }
            this._services = [];
            this._services$.next(this._services);
            this._isRunning.next(true);
            // debug('Hostname: ', this._hostname);
            debug('Zero conf watch: ', this.options);
            this.zeroconf.watch(this.options.type, this.options.domain, (result) => {
                debug('Zero conf result', result);
                const action = result.action;
                const service = result.service;
                if (service) {
                    switch (action) {
                        case 'added':
                            break;
                        case 'resolved':
                            this._onServiceResolved(resolveHost(service));
                            break;
                        default:
                            this._removeService(resolveHost(service));
                    }
                }
            });
        }
        catch (err) {
            this._isRunning.next(false);
            debug('_start error', err);
            throw err;
        }
    }

    private _removeService(service: CordovaNetworkScanResult) {
        const existsingIndex = this._findServiceIndex(service);
        if (existsingIndex >= 0) {
            this._services.splice(existsingIndex, 1);
        }
        this._services$.next(this._services);
    }

    private _findServiceIndex(service: CordovaNetworkScanResult) {
        return this._services.findIndex((s2) => JSON.stringify(s2) === JSON.stringify(service));
    }

    private _onServiceResolved(service: CordovaNetworkScanResult) {
        if (this._findServiceIndex(service) < 0) {
            this._services.push(service);
            debug('Emit new results: ', this._services);
            this._services$.next(this._services);
        }
    }
}

function resolveHost(input: ServiceType): CordovaNetworkScanResult {
    const host = input.ipv4Addresses && input.ipv4Addresses.length > 0 ? input.ipv4Addresses[0] : undefined;
    return {
        ...input,
        host
    }
}