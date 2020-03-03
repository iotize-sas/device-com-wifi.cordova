import { WifiComProtocol } from "./wifi-com-protocol";

describe("WifiComProtocol", function () {

    it("create instance should work", function(){
        const instance = new WifiComProtocol({
            socket: {
                url: 'tcp://192.168.20.100:2000'
            }
        }, (options) => {
            return null as any
        });
    });

});