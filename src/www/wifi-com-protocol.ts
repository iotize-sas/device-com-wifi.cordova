import { WifiComProtocolOptions } from "./definitions";
import { CordovaInterface } from "./cordova-interface";
import { debug } from "./logger";
import { ComProtocol, ComProtocolConnectOptions, ComProtocolDisconnectOptions, ConnectionState } from "@iotize/device-client.js/protocol/api";
import { QueueComProtocol } from "@iotize/device-client.js/protocol/impl";
import { Observable, Subscriber, from, of, Subscription } from "rxjs";
import { share } from "rxjs/operators";

declare var WifiWizard2: CordovaInterface;

export class WifiComProtocol extends QueueComProtocol {
    private _socketProtocol?: ComProtocol;
    private subProtocolConnectionStateSub?: Subscription;

    constructor(public wifiOptions: WifiComProtocolOptions, public createSubProtocol: (options: WifiComProtocolOptions) => ComProtocol | Promise<ComProtocol>) {
        super();
    }

    _connect(options?: ComProtocolConnectOptions): Observable<any> {
        return Observable.create(async (emitter: Subscriber<any>) => {
            try {
                if (this.wifiOptions.network) {
                    let currentSSID = await WifiWizard2.getConnectedSSID();
                    if (currentSSID !== this.wifiOptions.network.SSID) {
                        debug('currently connected to', currentSSID, 'expected ', this.wifiOptions.network.SSID, '=> try to connect to ', this.wifiOptions.network);
                        await WifiWizard2.connect(
                            this.wifiOptions.network.SSID,
                            false,
                            this.wifiOptions.network.password,
                            this.wifiOptions.network.algorithm,
                            this.wifiOptions.network.hidden
                        )
                    }
                    debug('connected to SSID', currentSSID);
                }
                debug('Now creating socket protocol with options', this.wifiOptions);
                this._socketProtocol = await this.createSubProtocol(this.wifiOptions);
                if (this.subProtocolConnectionStateSub) this.subProtocolConnectionStateSub.unsubscribe();
                this.subProtocolConnectionStateSub = this._socketProtocol.onConnectionStateChange()
                    .subscribe((event) => {
                        this.setConnectionState(event.newState);
                    });
                await this._socketProtocol.connect().toPromise();
                emitter.complete();
            }
            catch (err) {
                // CONNECT_FAILED_TIMEOUT
                // WIFI_NOT_ENABLED
                // TODO add wrapper and user friendly message for different error codes
                if (this.subProtocolConnectionStateSub) this.subProtocolConnectionStateSub.unsubscribe();
                debug('_connect error', err);
                emitter.error(typeof err === "string" ? new Error(err) : err); // TODO proper error
            }
        })
            .pipe(
                share()
            );

    }

    _disconnect(options?: ComProtocolDisconnectOptions): Observable<any> {
        if (this.subProtocolConnectionStateSub) this.subProtocolConnectionStateSub.unsubscribe();
        if (!this._socketProtocol) {
            return of(true);
        }
        return this._socketProtocol.disconnect();
    }

    write(data: Uint8Array): Promise<any> {
        // TODO check _socketProtocol
        return this._socketProtocol.write(data);
    }

    read(): Promise<Uint8Array> {
        // TODO check _socketProtocol
        return this._socketProtocol.read();
    }

}