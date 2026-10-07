import AVFoundation
import UIKit

/// `NativeModules.SpeedyBirdModule` for the game (see src/platform/host.ts): sound effects,
/// the saved best score, and VoiceOver announcements.
///
/// Lynx calls these methods on its JavaScript thread; audio work is serialized on a private
/// queue and announcements are posted on the main thread.
@objcMembers
final class SpeedyBirdModule: NSObject, LynxModule {
    static var name: String { "SpeedyBirdModule" }

    static var methodLookup: [String: String] {
        [
            "play": NSStringFromSelector(#selector(play(_:))),
            "stopAudio": NSStringFromSelector(#selector(stopAudio)),
            "loadPreferences": NSStringFromSelector(#selector(loadPreferences(_:))),
            "savePreferences": NSStringFromSelector(#selector(savePreferences(_:))),
            "announce": NSStringFromSelector(#selector(announce(_:))),
        ]
    }

    private static let preferencesKey = "speedy-bird.preferences.v1"
    private static let soundFiles = [
        "flap": "sfx_wing",
        "score": "sfx_point",
        "collision": "sfx_hit",
        "fall": "sfx_die",
        "swoosh": "sfx_swooshing",
    ]

    private let audioQueue = DispatchQueue(label: "com.jonathanperis.speedybird.audio")
    private var players: [String: AVAudioPlayer] = [:]

    override init() {
        super.init()
        audioQueue.async { self.loadSounds() }
    }

    convenience init(param _: Any) {
        self.init()
    }

    private func loadSounds() {
        // Ambient: respects the silent switch and mixes with the player's own music.
        try? AVAudioSession.sharedInstance().setCategory(.ambient)
        for (sound, file) in Self.soundFiles {
            guard let url = Bundle.main.url(forResource: file, withExtension: "wav", subdirectory: "audio"),
                  let player = try? AVAudioPlayer(contentsOf: url)
            else {
                NSLog("SpeedyBird: missing sound %@", file)
                continue
            }
            player.prepareToPlay()
            players[sound] = player
        }
    }

    func play(_ sound: String) {
        audioQueue.async {
            guard let player = self.players[sound] else { return }
            player.currentTime = 0
            player.play()
        }
    }

    func stopAudio() {
        audioQueue.async {
            for player in self.players.values {
                player.stop()
                player.currentTime = 0
            }
        }
    }

    func loadPreferences(_ callback: LynxCallbackBlock) {
        callback(UserDefaults.standard.string(forKey: Self.preferencesKey) ?? "")
    }

    func savePreferences(_ value: String) {
        UserDefaults.standard.set(value, forKey: Self.preferencesKey)
    }

    func announce(_ message: String) {
        DispatchQueue.main.async {
            UIAccessibility.post(notification: .announcement, argument: message)
        }
    }

    func destroy() {
        stopAudio()
    }
}
