package store.buywise.app;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.util.Log;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.PendingPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class AndroidBillingBridge implements PurchasesUpdatedListener {

    private Activity activity;
    private WebView webView;
    private BillingClient billingClient;

    public AndroidBillingBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        setupBillingClient();
    }

    private void setupBillingClient() {
        PendingPurchasesParams pendingParams = PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .enablePrepaidPlans()
                .build();
                
        billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(pendingParams)
                .build();
                
        startConnection();
    }
    
    private void startConnection() {
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d("Billing", "Setup successful");
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Try to restart the connection on the next request to
                // Google Play by calling the startConnection() method.
            }
        });
    }

    @JavascriptInterface
    public void startPurchase(String productId) {
        startPurchase(productId, null);
    }

    @JavascriptInterface
    public void startPurchase(String productId, String couponCode) {
        if (!billingClient.isReady()) {
            startConnection();
            sendErrorToWeb("Billing client not ready");
            return;
        }
        
        String productType = productId.equals("buywise_founder_forever") 
            ? BillingClient.ProductType.INAPP 
            : BillingClient.ProductType.SUBS;

        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(productType)
                .build()
        );

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        billingClient.queryProductDetailsAsync(params,
            (billingResult, productDetailsList) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null && !productDetailsList.isEmpty()) {
                    ProductDetails productDetails = productDetailsList.get(0);
                    
                    List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
                    
                    BillingFlowParams.ProductDetailsParams.Builder productDetailsParamsBuilder = 
                        BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(productDetails);
                    
                    if (productType.equals(BillingClient.ProductType.SUBS)) {
                        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
                        if (offers != null && !offers.isEmpty()) {
                            // Find base plan or appropriate offer
                            String offerToken = offers.get(0).getOfferToken(); 
                            productDetailsParamsBuilder.setOfferToken(offerToken);
                        }
                    }
                    
                    productDetailsParamsList.add(productDetailsParamsBuilder.build());

                    BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                            .setProductDetailsParamsList(productDetailsParamsList)
                            .build();

                    activity.runOnUiThread(() -> {
                        billingClient.launchBillingFlow(activity, billingFlowParams);
                    });
                } else {
                    sendErrorToWeb("Product not found or unavailable");
                }
            }
        );
    }
    
    @JavascriptInterface
    public void restorePurchases() {
        if (!billingClient.isReady()) {
            startConnection();
            sendErrorToWeb("Billing client not ready");
            return;
        }
        
        // Query SUBS
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(),
            (billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    processPurchases(purchases);
                }
            }
        );
        
        // Query INAPP
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    processPurchases(purchases);
                }
            }
        );
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            processPurchases(purchases);
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            sendErrorToWeb("User canceled the purchase");
        } else {
            sendErrorToWeb("Purchase failed: " + billingResult.getDebugMessage());
        }
    }
    
    private void processPurchases(List<Purchase> purchases) {
        for (Purchase purchase : purchases) {
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                // Let backend verify and acknowledge
                sendSuccessToWeb(purchase);
            } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                sendPendingToWeb(purchase);
            }
        }
    }
    
    private void sendSuccessToWeb(Purchase purchase) {
        try {
            JSONObject data = new JSONObject();
            data.put("productId", purchase.getProducts().get(0));
            data.put("token", purchase.getPurchaseToken());
            
            String js = "window.dispatchEvent(new CustomEvent('buywisePurchaseSuccess', { detail: " + data.toString() + " }));";
            activity.runOnUiThread(() -> webView.evaluateJavascript(js, null));
        } catch (Exception e) {
            Log.e("BillingBridge", "Error creating JSON", e);
        }
    }
    
    private void sendPendingToWeb(Purchase purchase) {
        try {
            JSONObject data = new JSONObject();
            data.put("productId", purchase.getProducts().get(0));
            
            String js = "window.dispatchEvent(new CustomEvent('buywisePurchasePending', { detail: " + data.toString() + " }));";
            activity.runOnUiThread(() -> webView.evaluateJavascript(js, null));
        } catch (Exception e) {
            Log.e("BillingBridge", "Error creating JSON", e);
        }
    }

    private void sendErrorToWeb(String message) {
        try {
            JSONObject data = new JSONObject();
            data.put("message", message);
            
            String js = "window.dispatchEvent(new CustomEvent('buywisePurchaseError', { detail: " + data.toString() + " }));";
            activity.runOnUiThread(() -> webView.evaluateJavascript(js, null));
        } catch (Exception e) {
            Log.e("BillingBridge", "Error creating JSON", e);
        }
    }
}
