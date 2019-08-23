import { WifiComProtocolOptions } from "./definitions";
import { CordovaInterface } from "./cordova-interface";
import { debug } from "./logger";
import { ComProtocol, ComProtocolConnectOptions, ComProtocolDisconnectOptions } from "@iotize/device-client.js/protocol/api";
import { QueueComProtocol } from "@iotize/device-client.js/protocol/impl";
import { Observable, Subscriber, from, of } from "rxjs";

declare var WifiWizard2: CordovaInterface;

export class WifiComProtocol extends QueueComProtocol {
    private _socketProtocol?: ComProtocol;

    constructor(public wifiOptions: WifiComProtocolOptions, public createSubProtocol: (options: WifiComProtocolOptions) => ComProtocol | Promise<ComProtocol>) {
        super();
    }

    _connect(options?: ComProtocolConnectOptions): Observable<any> {
        return Observable.create(async (emitter: Subscriber<any>) => {
            try {
                if (this.wifiOptions.network) {
                    let currentSSID = await WifiWizard2.getConnectedSSID();
                    debug('currently connected to', currentSSID, 'expected ', this.wifiOptions.network.SSID);
                    if (currentSSID !== this.wifiOptions.network.SSID) {
                        debug('connect to network', this.wifiOptions.network);
                        await WifiWizard2.connect(
                            this.wifiOptions.network.SSID,
                            false,
                            this.wifiOptions.network.password,
                            this.wifiOptions.network.algorithm,
                            this.wifiOptions.network.hidden
                        )
                    }
                }
                this._socketProtocol = await this.createSubProtocol(this.wifiOptions);
                await this._socketProtocol.connect().toPromise();
                emitter.complete();
            }
            catch (err) {
                emitter.error(err);
            }
        });

    }

    _disconnect(options?: ComProtocolDisconnectOptions): Observable<any> {
        if (!this._socketProtocol) {
            return of(true);
        }
        return this._socketProtocol.disconnect();
    }

    write(data: Uint8Array): Promise<any> {
        return this._socketProtocol.write(data);
    }

    read(): Promise<Uint8Array> {
        return this._socketProtocol.read();
    }

}