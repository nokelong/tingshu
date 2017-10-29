// 0. apiLoadError (times * 2 -+1)

// 1. LoadError -> Skip | retry 3 times ()
// 2. Slow -> 15s not moving -> skip (ra009)

// Audio Control
import {soundManager} from "soundmanager"
import isFunction from "lodash/isFunction"
import { DEFAULT_VOLUME } from "../consts"
import once from "lodash/once"

// exports soundmanager to global context
window.soundManager = soundManager

const READY_STATES = ['uninitialised', 'failed', 'loading', 'success']
const PLAY_STATES = ['uninitialised', 'playing']

// const maxErrorLimit = 3
const AudioID = 'douradio-audio'

let nof = function () {}

export default class Audio {

  static RequiredOptions = [
    'onplay', 'onpause', 'onresume', 'onFinish', 'whileloading', 'whileplaying',
    'loadNextSong', 'onError', 'onLoadSlowly', 'onLoadQuickly', 'logError',
  ]

  constructor(options, callbacks) {
    let soundManagerOptions = options.soundmanager || {}

    // options
    options = Object.assign({
      timeout: parseInt(options["audio_timout_time"]) || 10000,
      lagTime: parseInt(options["audio_lag_time"]) || 1000,
      maxLagCount: parseInt(options["audio_max_lag_count"]) || 4,
      retryWaitime: 2000,
      maxErrorLimit: 3,
    }, callbacks)

    this._smReady = false

    // set sound url when unload
    this._soundURL = null

    // check options
    for (let key of Audio.RequiredOptions) {
      // bind this to these callbacks

      if (!options[key]) {
        console.warn('DOUAUDIO: missing option', key)
        options[key] = nof
      } else if (isFunction(options[key])) {
        options[key] = options[key].bind(null, this)
      }
    }

    // this.options //
    this.options = options

    // fm use mp3/mp4 audios
    soundManager.audioFormats.mp4.required = true

    let onReadyCallback = () => {
      // set flag to true
      this._smReady = true

      if (this._soundURL) {
        this.play(this._soundURL)
        this._soundURL = null
      }
    }

    soundManager.setup(Object.assign({
      allowScriptAccess: 'always',
      url: '/swf/soundmanager2/',
      useHTML5Audio: true,
      preferFlash: false,
      waitForWindowLoad: false,
      debugMode: true,
      flashVersion: 9,
      useHighPerformance: true,
      forceUseGlobalHTML5Audio: true,
      onready: onReadyCallback,
      defaultOptions: {
        volume: DEFAULT_VOLUME,
      },
      ontimeout: () => {
          // console.error('init soundmanager2 error')
        this.logError('init soundmanager2 failed')

        if (!soundManager.setupOptions.preferFlash) {
          soundManager.setup({
            preferFlash: true,
            onready: onReadyCallback,
          }).reboot()
        }
      },
    }, soundManagerOptions))
  }

  initAudio(url) {
    if (this.audio) {
      this.audio.destruct()
    }

    this.audio = soundManager.createSound({
      'url': url,
      'id': AudioID,
      'autoLoad': false,
      'autoPlay': false,
      'from': null,
      'loops': 1,

    // , 'onid3': null
    // , 'onload': null
      'onplay': () => {
        this.doIsPlayingCheck()
        this.options.onplay() // douradio.trigger('play')
      },
      'onpause': () => {
        this.clearChecker()
        this.options.onpause() // douradio.trigger('pause')
      },
      'onresume': () => {
        this.doIsPlayingCheck()
        this.options.onresume() // douradio.trigger('resume')
      },
      'onfinish': () => {
        this.clearChecker()
        return this.options.onFinish()
      },
      'onsuspend': this.onSuspend.bind(this),
      'whileloading': this.onWhileLoading.bind(this),
      'whileplaying': this.onWhilePlaying.bind(this),
      'onposition': null,
      'onstop': null,
    // , 'onfailure': null

      'multiShot': false,
      'multiShotEvents': false,

      'position': null,

    // , 'pan': 0,
      'stream': true,
    // 'to': null
    // 'type': null
    // 'usePolicyFile': false
      'volume': this._volume,
    })

    return this.audio
  }

  /**
   * onSuspend will be triggered in iOS/Android
   * when Browser choose to not auto-play/download the media
   * here we pause the audio, and let the use click the play button to
   * start buffering the song
   */
  onSuspend() {
    // console.log('onSuspend')
    // if (this.audio.bytesLoaded === 0) {this.audio.pause()}
  }

  isPlaying() {
    /*
    readyState:
      0 = uninitialised
      1 = loading
      2 = failed/error
      3 = loaded/success
    */
    if (!this.audio) {
      return false
    }

    return !this.audio.paused
  }

  togglePause() {
    if (!this.audio) {
      return this.options.onFinish()
    }
    this.audio.togglePause()
  }

  setVolume(value) {
    this._volume = value
    if (!this.audio) {
      return soundManager.setVolume(value)
    }
    return this.audio.setVolume(value)
  }

  getVolume() {
    if (this.audio) {
      return this.audio.volume
    }
    return this._volume
  }

  log() {
    return
    // return console.debug.apply(console, ['douaudio', ...arguments])
  }

  setPosition(position) {
    // set position of one audio
    if (position < 0) {
      position = this.audio.duration + position
    }
    this.audio.setPosition(position)
  }

  clearChecker() {
    // this._skipCount = 0
    // this.errorCount = 0
    this._lastPosition = null
    this._lagCount = 0
    if (this.isPlayingChecker) {
      window.clearTimeout(this._isPlayingChecker)
      this._isPlayingChecker = null
    }
  }
  /**
   * @use this._lastPosition
   * @use this._lagCount
   * @return
   */
  checkPlayerPosition() {
    if (!this.isPlaying()) {
      // clear
      this.clearChecker()
      return
    }

    let position = this.audio.position,
      now = Date.now()

    if (this._lastPosition) {
      let {position: lastPosition, time: lastTime} = this._lastPosition

      let psOffset = position - lastPosition,
        timeOffset = now - lastTime,
        diff = Math.abs(timeOffset - psOffset)

      // console.debug('time-offset: ', diff)
      if (diff > this.options.lagTime) {
        console.error('timediff: ', diff)
        if (this._lagTotal) {this._lagTotal += diff}

        if (this._lagTotal > this.options.timeout) {
          return this.onLoadSlowly(`total time == ${this._lagTotal}`)
        }

        if (!this._lagCount) {this._lagCount = 0}
        this._lagCount += 1
        if (this._lagCount >= this.options.maxLagCount) {
          return this.onLoadSlowly(`${this._lagCount} lags occurs`)
        }
      }
    }

    this._lastPosition = {position, time: now}
  }

  /**
   * (TimeoutHandler) _isPlayingChecker
   */
  doIsPlayingCheck(timeout) {
    if (!timeout) {
      timeout = this.options.timeout
    }

    if (this._isPlayingChecker) {
      window.clearTimeout(this._isPlayingChecker)
    }

    this._isPlayingChecker = window.setTimeout((checkerTime) => {
      if (checkerTime) {
        console.log('trigger playing checker:', {
          id: this._isPlayingChecker,
          endtime: Date.now(),
          begintime: checkerTime,
        })
        if (Date.now() - checkerTime < timeout) {
          return
        }
      }

      if (!this.isPlaying()) {
        return
      }

      this._isPlayingChecker = null
      // player did not response for 1 second
      this.onLoadSlowly('buffering time > 10s')
    }, timeout, Date.now())

  }

  onWhilePlaying() {
    this.doIsPlayingCheck()
    this.checkPlayerPosition()
    this.options.whileplaying()
  }

  /**
   * @return Nothing
   */
  onWhileLoading() {
    this.options.whileloading()

    if (this._isFinishLoaded) {
      return
    }

    let loadingPercent = this.audio.bytesLoaded / this.audio.bytesTotal
    if (loadingPercent > 0.99) {
      if (this.audio.position / this.audio.duration < 0.8) {
        this.options.onLoadQuickly()
        this._isFinishLoaded = true
      }
    }

  }

  // startBeplay() {}

  // pause the current playing song, play the next song
  play(url, position=null) {

    // url = 'http://localhost:3000/' + url.slice(24)

    this.clearChecker()

    // use in whileloading, set this to true when a sound is 100% loaded
    this._isFinishLoaded = false

    this.log('play: ', url)

    if (!this._smReady) {
      this._soundURL = url
      this.log('soundmanager is not ready, sound will be played after sm is ready')
      return
    }

    if (!this.audio) {
      this.initAudio(url)
    }

    this.audio.stop()
    this.audio.play({
      url: url,
      position: position,
      onload: (success) => {
        if (!success) {
          this.log('audio: audio load failure')
          return this.onLoadError()
        }
        // load success, clear error count
        this.errorCount = 0
      },
      onfailure: () => {
        this.log('[flashmode] audio: audio load failure')
        return this.onLoadError()
      },
    })

    this.doIsPlayingCheck(this.options.timeout)
  }

  /**
   * trigger when load error
   */
  onLoadError() {
    if (!this.errorCount) {
      this.errorCount = 0
    }
    this.errorCount += 1

    if (this.errorCount > this.options.maxErrorLimit) {
      this.log('Max error times reached, skip song')
      this.logError("MaxErrorTimesReached", 'san-common')
      this.errorCount = 0
      return this.loadNextSong()
    }

    this.log('Audio Load Error, retry after 2 seconds')

    this.retryHandler = window.setTimeout(() => {
      this.retryHandler = null
      this.log('Retrying:', this.errorCount)

      if (!soundManager.setupOptions.preferFlash) {
        // html5 maybe error, try flash once
        let url = this.audio.url
        return soundManager.setup({
          preferFlash: true,
          onready: () => {
            this.reloadAudio(url)
          },
        }).reboot()
      }

      this.reloadAudio()
    }, this.options.retryWaitime)
  }

  onLoadSlowly(reason) {
    // ['uninitialised', 'failed', 'loading', 'success']
    //  0              ,  1      , 2          , 3
    if (this.audio.readyState === 1) {
      // loading failed
      return this.onLoadError()
    }

    this.logError(reason, 'san-slow')
    return this.options.onLoadSlowly(reason)
  }

  unloadAudio() {
    this.audio.pause()
    soundManager.destroySound(AudioID)
    this.audio = null
  }

  /**
   * reload the song with same url
   */
  reloadAudio(url) {
    if (!this.audio) {
      console.debug('reload Audio without previous audio exists')
      return
    }

    if (!url) {
      url = this.audio.url
    }
    this.unloadAudio()
    this.play(url)
  }

  /**
   * load the next song, internal use only
   * @return Promise
   */
  loadNextSong() {
    if (!this._skipCount) {
      this._skipCount = 0
    }
    this._skipCount += 1

    if (this._skipCount > 3) {
      this._skipCount = 0
      this.log('max skip times reached, player will stopped')
      this.unloadAudio()
      this.options.onError()
      return
    }

    this.log('audio will skip for the ', this._skipCount, ' times')
    // unset currentSong
    return this.options.loadNextSong()
  }

  logError(reason, kind="san-common") {
    let audio = this.audio
    if (!audio) {
      return
    }

    return this.options.logError(kind, {
      readyState: READY_STATES[audio.readyState],
      playState: PLAY_STATES[audio.playState],
      engine: this.audio.isHTML5 ? 'html5' : 'flash',
      reason: reason,
    })
  }

}



// WEBPACK FOOTER //
// ./src/douradio/audio/audio.js