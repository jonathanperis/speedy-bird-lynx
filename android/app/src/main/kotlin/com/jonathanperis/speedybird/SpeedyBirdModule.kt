package com.jonathanperis.speedybird

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import com.lynx.jsbridge.LynxMethod
import com.lynx.jsbridge.LynxModule
import com.lynx.react.bridge.Callback
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

class SpeedyBirdModule(context: Context) : LynxModule(context) {
    private val preferences = context.getSharedPreferences("speedy-bird", Context.MODE_PRIVATE)
    private val pool = SoundPool.Builder().setMaxStreams(5)
        .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()).build()
    private val loaded = Collections.newSetFromMap(ConcurrentHashMap<Int, Boolean>())
    private val streams = ConcurrentHashMap<String, Int>()
    private val sounds: Map<String, Int>

    init {
        pool.setOnLoadCompleteListener { _, id, status -> if (status == 0) loaded.add(id) }
        sounds = mapOf("flap" to "sfx_wing", "score" to "sfx_point", "collision" to "sfx_hit",
            "fall" to "sfx_die", "swoosh" to "sfx_swooshing").mapValues { (_, file) ->
            context.assets.openFd("audio/$file.wav").use { pool.load(it, 1) }
        }
    }

    @LynxMethod
    fun play(sound: String) {
        val id = sounds[sound] ?: return
        if (!loaded.contains(id)) return
        streams.remove(sound)?.let { pool.stop(it) }
        streams[sound] = pool.play(id, 1f, 1f, 1, 0, 1f)
    }

    @LynxMethod
    fun stopAudio() {
        streams.values.forEach { pool.stop(it) }
        streams.clear()
    }

    @LynxMethod
    fun loadPreferences(callback: Callback) {
        callback.invoke(preferences.getString("preferences.v1", "") ?: "")
    }

    @LynxMethod
    fun savePreferences(value: String) {
        preferences.edit().putString("preferences.v1", value).apply()
    }

    override fun destroy() {
        stopAudio()
        pool.release()
        super.destroy()
    }
}
