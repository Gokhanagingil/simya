package com.gokhanagingil.simya;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** Sistem yazı boyutu, oyunun kendi yazı boyutu ayarına ilk açılışta öneri olarak aktarılır. */
    public static class NativeInfo {
        private final float fontScale;

        NativeInfo(float fontScale) {
            this.fontScale = fontScale;
        }

        @JavascriptInterface
        public float getFontScale() {
            return fontScale;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        // Yazı büyütme oyunun içindeki ayarla yönetilir; sistem ölçeği ikinci kez uygulanıp
        // ekranları bozmasın diye WebView yakınlaştırması sabitlenir.
        float fontScale = getResources().getConfiguration().fontScale;
        settings.setTextZoom(100);
        settings.setSupportZoom(false);
        webView.addJavascriptInterface(new NativeInfo(fontScale), "SimyaNative");
    }
}
