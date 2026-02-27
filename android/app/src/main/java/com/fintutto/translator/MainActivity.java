package com.fintutto.translator;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(HotspotRelayPlugin.class);
        registerPlugin(BleTransportPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
