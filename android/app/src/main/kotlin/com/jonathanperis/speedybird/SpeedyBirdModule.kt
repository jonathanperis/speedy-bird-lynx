package com.jonathanperis.speedybird

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import com.lynx.jsbridge.LynxMethod
import com.lynx.jsbridge.LynxModule
import com.lynx.react.bridge.Callback
import java.util.Collections

/**
 * `NativeModules.SpeedyBirdModule` for the game (see src/platform/host.ts): low-latency
 * sound effects, the saved best score, and screen-reader announcements.
 *
 * Lynx calls these methods on its JavaScript thread. SoundPool and SharedPreferences are
 * thread-safe; announcements are forwarded to [Announcer], which posts to the UI thread.
 */
class SpeedyBirdModule(context: Context, param: Any?) : LynxModule(context, param) {

    /** Supplied by the host Activity through `registerModule(..., param)`. */
    fun interface Announcer {
        fun announce(message: String)
    }

    private val announcer = param as? Announcer
    private val preferences = context.getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE)
    private val loaded: MutableSet<Int> = Collections.synchronizedSet(HashSet())
    private val pool: SoundPool = SoundPool.Builder()
        .setMaxStreams(MAX_STREAMS)
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build(),
        )
        .build()
        .apply { setOnLoadCompleteListener { _, sampleId, status -> if (status == 0) loaded.add(sampleId) } }

    private val sounds: Map<String, Int> = SOUND_FILES.mapValues { (_, file) ->
        context.assets.openFd("audio/$file").use { pool.load(it, 1) }
    }

    @LynxMethod
    fun play(sound: String) {
        val sampleId = sounds[sound] ?: return
        // A sound that has not finished decoding is skipped rather than played late.
        if (sampleId in loaded) pool.play(sampleId, 1f, 1f, 1, 0, 1f)
    }

    @LynxMethod
    fun stopAudio() {
        pool.autoPause()
    }

    @LynxMethod
    fun loadPreferences(callback: Callback) {
        callback.invoke(preferences.getString(PREFERENCES_KEY, "") ?: "")
    }

    @LynxMethod
    fun savePreferences(value: String) {
        preferences.edit().putString(PREFERENCES_KEY, value).apply()
    }

    @LynxMethod
    fun announce(message: String) {
        announcer?.announce(message)
    }

    override fun destroy() {
        pool.release()
        super.destroy()
    }

    companion object {
        const val NAME = "SpeedyBirdModule"
        const val PREFERENCES_FILE = "speedy-bird"
        private const val PREFERENCES_KEY = "preferences.v1"
        private const val MAX_STREAMS = 4

        private val SOUND_FILES = mapOf(
            "flap" to "sfx_wing.wav",
            "score" to "sfx_point.wav",
            "collision" to "sfx_hit.wav",
            "fall" to "sfx_die.wav",
            "swoosh" to "sfx_swooshing.wav",
        )
    }
}
