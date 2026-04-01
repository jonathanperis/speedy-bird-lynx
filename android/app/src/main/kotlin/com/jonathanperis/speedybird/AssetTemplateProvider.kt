package com.jonathanperis.speedybird

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider
import java.io.ByteArrayOutputStream

class AssetTemplateProvider(context: Context) : AbsTemplateProvider() {

    private val appContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Thread {
            try {
                appContext.assets.open(uri).use { inputStream ->
                    ByteArrayOutputStream().use { output ->
                        val buffer = ByteArray(4096)
                        var length: Int
                        while (inputStream.read(buffer).also { length = it } != -1) {
                            output.write(buffer, 0, length)
                        }
                        callback.onSuccess(output.toByteArray())
                    }
                }
            } catch (e: Exception) {
                callback.onFailed(e.message ?: "Failed to load template")
            }
        }.start()
    }
}
