// Runs inside Lynx's background worker. Each call is forwarded to the page, which owns
// audio and storage (see host.ts).
export default function createSpeedyBirdModule(_nativeModules, callHost) {
  return {
    play: (sound) => callHost('play', sound),
    stopAudio: () => callHost('stopAudio', null),
    loadPreferences: (callback) => callHost('loadPreferences', null).then(callback),
    savePreferences: (value) => callHost('savePreferences', value),
    announce: (message) => callHost('announce', message),
    reportHud: (json) => callHost('reportHud', json),
  };
}
