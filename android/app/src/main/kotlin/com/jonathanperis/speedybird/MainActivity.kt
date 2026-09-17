package com.jonathanperis.speedybird

import android.app.Activity
import android.os.Bundle
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder
import com.lynx.react.bridge.JavaOnlyArray

class MainActivity : Activity() {
    private lateinit var lynxView: LynxView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lynxView = buildLynxView()
        setContentView(lynxView)
        lynxView.renderTemplateUrl("main.lynx.bundle", "")
    }

    private fun buildLynxView(): LynxView {
        val viewBuilder = LynxViewBuilder()
        viewBuilder.registerModule("SpeedyBirdModule", SpeedyBirdModule::class.java)
        viewBuilder.setTemplateProvider(AssetTemplateProvider(this))
        return viewBuilder.build(this)
    }

    override fun onPause() {
        lynxView.sendGlobalEvent("SpeedyBirdPause", JavaOnlyArray())
        lynxView.onEnterBackground()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        lynxView.onEnterForeground()
    }

    override fun onDestroy() {
        lynxView.destroy()
        super.onDestroy()
    }
}
