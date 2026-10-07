package com.jonathanperis.speedybird

import android.app.Activity
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import com.lynx.react.bridge.JavaOnlyArray
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder

class MainActivity : Activity() {

    private lateinit var lynxView: LynxView
    private lateinit var announcer: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lynxView = buildLynxView()
        // A 1px polite live region: screen readers speak game-state changes written to it
        // without disturbing the accessibility tree Lynx builds for the game.
        announcer = TextView(this).apply {
            accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
            layoutParams = FrameLayout.LayoutParams(1, 1)
        }
        setContentView(
            FrameLayout(this).apply {
                addView(lynxView, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
                addView(announcer)
            },
        )
        enterImmersiveMode()
        lynxView.renderTemplateUrl("main.lynx.bundle", "")
    }

    private fun buildLynxView(): LynxView {
        val viewBuilder = LynxViewBuilder()
        viewBuilder.setTemplateProvider(AssetTemplateProvider(this))
        viewBuilder.registerModule(
            SpeedyBirdModule.NAME,
            SpeedyBirdModule::class.java,
            SpeedyBirdModule.Announcer { message -> runOnUiThread { announce(message) } },
        )
        return viewBuilder.build(this)
    }

    private fun announce(message: String) {
        // Updating a live region replaces the deprecated View.announceForAccessibility.
        if (!isDestroyed) announcer.text = message
    }

    /** Full-bleed game: draw under the cutout and hide the system bars until swiped in. */
    private fun enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes = window.attributes.apply {
                layoutInDisplayCutoutMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                } else {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.systemBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                )
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        // Bars revealed by a swipe or a dialog are hidden again when the game regains focus.
        if (hasFocus) enterImmersiveMode()
    }

    override fun onResume() {
        super.onResume()
        lynxView.onEnterForeground()
        lynxView.sendGlobalEvent(RESUME_EVENT, JavaOnlyArray())
    }

    override fun onPause() {
        // Pause a run in progress before the app leaves the foreground.
        lynxView.sendGlobalEvent(PAUSE_EVENT, JavaOnlyArray())
        lynxView.onEnterBackground()
        super.onPause()
    }

    override fun onDestroy() {
        lynxView.destroy()
        super.onDestroy()
    }

    private companion object {
        const val PAUSE_EVENT = "SpeedyBirdPause"
        const val RESUME_EVENT = "SpeedyBirdResume"
    }
}
