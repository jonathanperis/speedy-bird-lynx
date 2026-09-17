// This factory executes in Lynx's background worker. DOM/audio/storage stay in the host.
export default function (_modules, callHost) {
  return {
    play: sound => callHost('play', sound),
    stopAudio: () => callHost('stopAudio', null),
    loadPreferences: callback => callHost('loadPreferences', null).then(callback),
    savePreferences: value => callHost('savePreferences', value),
  };
}
