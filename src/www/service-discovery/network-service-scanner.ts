// //
// //  Copyright 2019 IoTize SAS Inc.  Licensed under the MIT license. 
// //
// // import { ServiceDiscovery } from './cordova-interface';
// import { Observable, Subject } from 'rxjs';
// import { debug } from '../logger';
// import { ServiceType } from '../definitions';

// declare var serviceDiscovery: ServiceDiscovery;

// /**
//  * Scan service on current network
//  */
// export class NetworkServiceScanner {

//     private _services = new Subject<ServiceType[]>();
//     private _errors = new Subject<Error>();

//     constructor() {
//     }

//     isAvailable(): boolean {
//         return typeof serviceDiscovery !== undefined;
//     }

//     get services(): Observable<ServiceType[]> {
//         return this._services.asObservable();
//     }

//     get errors(): Observable<Error> {
//         return this._errors.asObservable();
//     }

//     scan(type: string): Promise<ServiceType[]>{
//         return this._scan(type);
//         // return this.services;
//     }

//     private async _scan(type: string): Promise<ServiceType[]>{
//         return new Promise((resolve, reject) => {
//             try {
//             debug('_scan', type);
//             serviceDiscovery
//                 .getNetworkServices(type, (devices: ServiceType[]) => {
//                     debug(`Found devices for type ${type}`, devices);
//                     this._services.next(devices);
//                     resolve(devices);
//                 }, (err) => {
//                     debug('ERROR', err);
//                     this._errors.next(err);
//                     reject(err);
//                 })
//             }
//             catch (err){
//                 reject(err);
//             }
//         });

//     }

// }
