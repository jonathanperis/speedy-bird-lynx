package com.jonathanperis.speedybird

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider
import java.util.concurrent.Executors

/** Loads Lynx bundles packaged in the APK's assets, off the UI thread. */
class AssetTemplateProvider(context: Context) : AbsTemplateProvider() {

    private val appContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        loader.execute {
            try {
                callback.onSuccess(appContext.assets.open(uri).use { it.readBytes() })
            } catch (e: Exception) {
                callback.onFailed(e.message ?: "Failed to load template $uri")
            }
        }
    }

    private companion object {
        val loader = Executors.newSingleThreadExecutor { runnable ->
            Thread(runnable, "lynx-template-loader").apply { isDaemon = true }
        }
    }
}
