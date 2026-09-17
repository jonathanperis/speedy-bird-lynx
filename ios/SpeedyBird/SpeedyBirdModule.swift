import AVFoundation
import Foundation

@objcMembers
final class SpeedyBirdModule: NSObject, LynxModule {
    static var name: String { "SpeedyBirdModule" }
    static var methodLookup: [String: String] {
        ["play": NSStringFromSelector(#selector(play(_:))),
         "stopAudio": NSStringFromSelector(#selector(stopAudio)),
         "loadPreferences": NSStringFromSelector(#selector(loadPreferences(_:))),
         "savePreferences": NSStringFromSelector(#selector(savePreferences(_:)))]
    }
    private var players: [String: AVAudioPlayer] = [:]
    private let preferenceKey = "speedy-bird.preferences.v1"

    convenience init(param: Any) { self.init() }

    override init() {
        super.init()
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient)
            let files = ["flap": "sfx_wing", "score": "sfx_point", "collision": "sfx_hit",
                         "fall": "sfx_die", "swoosh": "sfx_swooshing"]
            for (sound, file) in files {
                guard let url = Bundle.main.url(forResource: file, withExtension: "wav", subdirectory: "audio") else {
                    NSLog("Missing packaged game sound: %@", file)
                    continue
                }
                let player = try AVAudioPlayer(contentsOf: url)
                player.prepareToPlay()
                players[sound] = player
            }
        } catch { NSLog("Game audio initialization failed: %@", error.localizedDescription) }
    }

    func play(_ sound: String) {
        guard let player = players[sound] else { return }
        player.currentTime = 0
        player.play()
    }

    func stopAudio() {
        players.values.forEach { $0.stop(); $0.currentTime = 0 }
    }

    func loadPreferences(_ callback: LynxCallbackBlock) {
        callback(UserDefaults.standard.string(forKey: preferenceKey) ?? "")
    }

    func savePreferences(_ value: String) {
        UserDefaults.standard.set(value, forKey: preferenceKey)
    }

    func destroy() { stopAudio(); players.removeAll() }
}
