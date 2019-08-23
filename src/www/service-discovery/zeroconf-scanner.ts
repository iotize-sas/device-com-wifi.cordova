import { DeviceScanner, DeviceScannerOptions } from '@iotize/device-client.js/device/scanner/device-scanner';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { debug } from '../logger';
import { ZeroConf } from './cordova-interface';
import { CordovaNetworkScanResult } from '../definitions';

declare var cordova: any | undefined;
declare var zeroconf: ZeroConf;

export class ZeroConfScannerCordova implements DeviceScanner<CordovaNetworkScanResult> {
    _hostname: string;
    options = {
        domain: 'local.',
        type: '_tapm2m._tcp.'
    };
    _services: CordovaNetworkScanResult[] = [];
    _services$ = new Subject<CordovaNetworkScanResult[]>();
    _isRunning = new BehaviorSubject<boolean>(false);

    constructor() {
        if (typeof cordova != undefined && cordova && cordova.plugins) {
            zeroconf = cordova.plugins.zeroconf;
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

    set type(type: string){
        this.options.type = type;
    }

    set domain(domain: string) {
        this.options.domain = domain;
    }

    /**
     * Start scan
     */
    start(option?: DeviceScannerOptions): Promise<void> {
        debug('ZeroConfScanner', 'start');
        return this._start();
    }

    stop() {
        debug('ZeroConfScanner', 'stop', this.options);
        // zeroconf.close()
        zeroconf.unwatch(
            this.options.type
            , this.options.domain
            , () => {
                debug('unwatch stop', this.options);
            }, (err) => {
                debug('unwatch error', err);
            });
        this._isRunning.next(false);
    }

    getHostname(): Promise<string> {
        return new Promise((resolve) => {
            zeroconf.getHostname((hostname: string) => {
                resolve(hostname);
            });
        })
    }

    private async _start() {
        try {
            // if (!this._hostname) {
            //     this._hostname = await this.getHostname();
            // }
            this._isRunning.next(true);
            debug('Hostname: ', this._hostname);
            debug('Zero conf watch: ', this.options);
            zeroconf.watch(this.options.type, this.options.domain, (result) => {
                debug('Zero conf result', result);
                var action = result.action;
                var service = result.service;
                switch (action) {
                    case 'added':
                        break;
                    case 'resolved':
                        this._onServiceResolved(service);
                        break;
                    default:
                        this._removeService(service);
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
        let existsingIndex = this._findServiceIndex(service);
        if (existsingIndex >= 0) {
            this._services.splice(existsingIndex, 1);
        }
        this._services$.next(this._services);
    }

    private _findServiceIndex(service: CordovaNetworkScanResult) {
        return this._services.findIndex((s2) => JSON.stringify(s2) == JSON.stringify(service));
    }

    private _onServiceResolved(service: CordovaNetworkScanResult) {
        if (this._findServiceIndex(service) < 0) {
            this._services.push(service);
            this._services$.next(this._services);
        }
    }
}