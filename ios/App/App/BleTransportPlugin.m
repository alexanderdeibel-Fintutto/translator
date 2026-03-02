#import <Capacitor/Capacitor.h>

CAP_PLUGIN(BleTransportPlugin, "BleTransport",
    CAP_PLUGIN_METHOD(startServer, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(broadcast, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopServer, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
)
