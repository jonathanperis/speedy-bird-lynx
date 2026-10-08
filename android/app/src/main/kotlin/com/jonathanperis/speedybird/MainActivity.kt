package com.jonathanperis.speedybird

import android.app.Activity
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
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
        WindowCompat.enableEdgeToEdge(window)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    // A window can lose focus while the activity stays resumed (notification shade, dialogs,
    // multi-window). Pause then too; the game ignores repeated pause events.
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            // Bars revealed by a swipe or a dialog are hidden again.
            enterImmersiveMode()
            lynxView.sendGlobalEvent(RESUME_EVENT, JavaOnlyArray())
        } else {
            lynxView.sendGlobalEvent(PAUSE_EVENT, JavaOnlyArray())
        }
    }

    // Losing focus pauses the game; only leaving the screen suspends Lynx, after the pause
    // event has been handled (see the matching iOS ViewController).
    override fun onStart() {
        super.onStart()
        lynxView.onEnterForeground()
    }

    override fun onResume() {
        super.onResume()
        lynxView.sendGlobalEvent(RESUME_EVENT, JavaOnlyArray())
    }

    override fun onPause() {
        lynxView.sendGlobalEvent(PAUSE_EVENT, JavaOnlyArray())
        super.onPause()
    }

    override fun onStop() {
        lynxView.onEnterBackground()
        super.onStop()
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
