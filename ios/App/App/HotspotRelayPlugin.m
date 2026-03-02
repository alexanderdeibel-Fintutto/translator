#import <Capacitor/Capacitor.h>

CAP_PLUGIN(HotspotRelayPlugin, "HotspotRelay",
    CAP_PLUGIN_METHOD(startHotspot, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startRelayOnly, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopHotspot, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
)
