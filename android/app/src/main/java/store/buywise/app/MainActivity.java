package store.buywise.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = this.getBridge().getWebView();
        webView.addJavascriptInterface(
            new AndroidBillingBridge(this, webView), 
            "AndroidBillingBridge"
        );
    }
}
