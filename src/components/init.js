import createDouaudio from "./audio"
import Artist from "./artist"
import Song from "./song"
import Channel from "./channel"
import ApiClient from "./apiclient.web"
import Songlist from "./songlist"
import Logger from "./logger"
import MineSonglists from "./songlist/mine"
import {parseCookie} from "./utils"
import defer from "promise-defer"

import includes from "lodash/includes"
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

// Events Consts

import {
  NO_PERMISSION_TO_SWITCH_PLAYLIST
  , DEFAULT_VOLUME,
} from './consts'

var {
  isNumber,
  isString,
  isObject,
  extend,
  defaults,
} = require("underscore")

let isObjectId = (id) => {
  return isNumber(id) || isString(id)
}

// kbps list for pro users
export const PRO_KBPS = ['128', '192', '320']

// kbps list for normal users
export const NORMAL_KBPS = ['128']

module.exports = class Douradio {
  Channel = Channel
  Songlist = Songlist
  Artist = Artist
  Song = Song

  defaultOptions = {
    ajax: null,
    apiClient: null,
    Events: null,
    domready: null,
    apiroot: "/v2/fm/",
    apikey: "",
    apisecret: "",
    udid: "",
    bid: "",
    bitrate: "auto",
    userinfo: null,
    maxErrorLimit: 2,
  }

  _playlist = null
  _nextPlaylist = null
  _audioErrorCount = null
  _actionLoading = false

  constructor(options = {}) {
    this.options = defaults(options, this.defaultOptions)

    for (let rOpt of ["Events"]) {
      !this.options[rOpt] ? console.error("Option ", rOpt, " is not exists!") : undefined
    }

    options.apiClient ? this.apiClient = options.apiClient : this.apiClient = new ApiClient(this.options)

    options.Events ? extend(this, options.Events) : undefined

    for (let i of ["oauthUrl", "getLyric"]) {
      this.apiClient[i] ? this[i] = this.apiClient[i].bind(this.apiClient) : undefined
    }

    options.bitrate ? this.setKbps(options.bitrate) : undefined
    this.logger = new Logger(this.apiClient)
    this.mineSonglists = new MineSonglists(this)
    !options.bid ? this.options.bid = parseCookie().bid : undefined
    this.currentAudio = createDouaudio(this, this.options.audio)
   
    // Catch Auto play fail on safari 11
    // detail at https://github.intra.douban.com/FM/fm/issues/1793

    // TODO:
    // soundmanager2 ( the playing lib we using) doesn't expose this promise
    // exception for us to use now, see if it's possible in the future
    // https://github.com/scottschiller/SoundManager2/issues/178

    window.addEventListener('unhandledrejection', event => {
      event.preventDefault()
      if (event && event.reason.name === "NotAllowedError") {
        this.togglePause()
      }
    })

  }

  // helper function
  reportError(error) {
    console.error('[Douradio]', error)
    this.trigger('error', error)
  }


  isPlaying() {
    return this.currentAudio.isPlaying()
  }

  _onfinish() {
    this.getNextSong().then(theNextSong => {
      return this._switchSong(theNextSong)
    })

    this.trigger("finish", this.currentSong)
    return this.logger.log(this.currentSong, this._playlist, "p")
  }

 /**
  * [getNextSong description]
  * @param  {[type]} type set force
  * @return {[type]}
  */
  getNextSong(type) {
    if (this._nextPlaylist) {
      if (this._playlist) {
        this._playlist.destroy()
      }
      this._playlist = this._nextPlaylist
      this._nextPlaylist = null
    }
    let pms = this._playlist.getNextSong(type)
    return pms
  }

  /**
   * [_switchSong description]
   * @param  {[type]} songModel [description]
   * @param  {[type]} play      =             true [description]
   * @param  {[type]} position  [description]
   * @return {[type]}           [description]
   */
  _switchSong(songModel, play = true, position) {
    var ref

    if (!songModel.isReady()) {
      return songModel.fetch().then(() => {
        return this._switchSong(songModel, play, position)
      })
    }

    var dfed = defer(Promise)

    if (!songModel.isPlayable()) {
      console.error("Song is not playeable!", songModel)
      return dfed.reject("Song is not playable!")
    }
    var songUrl = songModel.get("url")

    if (!songUrl) {
      return this.getNextSong().then(theNextSong => {
        return this._switchSong(theNextSong)
      })
    }

    position = position || songModel.get("position") || 0
    this.currentAudio.play(songUrl, position)
    var prevSong = this.currentSong
    this.currentSong = songModel

    songModel.set({
      isPlaying: true,
    })

    if (prevSong) {
      prevSong.set({
        isPlaying: false,
      })
    }

    this.trigger("switch_song", songModel)
    dfed.resolve()
    return dfed.promise
  } 

  getPlayerState() {
    var ref
    var state = {}

    this.currentSong ? state["current_song"] = extend(this.currentSong.toJSON(), {
      position: (ref = this.currentAudio.audio) != null ? ref.position : void 0,
    }) : undefined

    this._playlist ? state[this._playlist.type + "_id"] = this._playlist.id : undefined

    return state
  }

  destroy() {}
 

  togglePause() {
    return this.currentAudio.togglePause()
  }

  isLoading() {
    return this._actionLoading
  }

  /**
   * this method will call everytime
   */
  _beginLoading() {
    // this.currentAudio.audio.pause()
    this._actionLoading = true
    return this.trigger("request")
  }

  _endLoading() {
    return this._actionLoading = false
  }

  skip() {
    if (this._actionLoading) {
      return Promise.reject("Previous action is requesting")
    }

    if (!this._playlist) {
      return this.switchToFallbackChannel()
    }

    this.currentSong ? this.logger.log(this.currentSong, this._playlist, "j") : undefined
    this.trigger("skip")
    var pms = null

    if (this._playlist.skip) {
      pms = this._playlist.skip()
      this._nextPlaylist ? pms = this.getNextSong() : undefined
    } else {
      pms = this.getNextSong()
    }

    this._beginLoading()

    return pms.then(theNextSong => {
      this._endLoading()
      return this._switchSong(theNextSong)
    }, error => {
      this._endLoading()
      return this.reportError("切歌出错")
    })
  }

  prev() {
    var pms
    var pms

    if (this._actionLoading) {
      return Promise.reject("Previous action is requesting")
    }

    this.currentSong ? this.logger.log(this.currentSong, this._playlist, "k") : undefined

    if (this.isProgramme()) {
      this._nextPlaylist ? pms = this.getNextSong() : pms = this._playlist.getPrevSong()
      this._beginLoading()

      return pms.then(thePrevSong => {
        this._endLoading()
        return this._switchSong(thePrevSong)
      }, error => {
        this.reportError("[prev] error")
        return this._endLoading()
      })
    } else {
      return console.warn("Call prev in non programme playlist is not allowed!")
    }
  }

  ban() {
    if (this._actionLoading) {
      return Promise.reject("Previous action is requesting")
    }

    if (!this._playlist) { return }

    let pms = this._playlist && this._playlist.ban()

    if (this._nextPlaylist) {
      pms = this.getNextSong()
    }

    this._beginLoading()

    return pms.then(song => {
      this._endLoading()
      return this._switchSong(song)
    }, (error) => {
      // switch to fallback channel
      this.switchToFallbackChannel()
      this.reportError(error)
      return this._endLoading()
    })
  }

  playNext(id, type = "channnel") {
    var pl = null

    if (!this._playlist) {
      if (type === "songlist") {
        return this.switchProgramme(id)
      } else {
        return this.switchChannel(id)
      }
    }

    type === "songlist" ? pl = this.getSonglist(id) : pl = new Channel(id, {
      douradio: this,
    })

    this._nextPlaylist = pl

    return pl.fetch().then(() => {
      return this.trigger("will_switch_playlist")
    })
  }

  unplayNext() {
    this._nextPlaylist.destroy()
    this._nextPlaylist = null
    return this.trigger("will_switch_playlist")
  }

  getCurrentPlaylist() {
    return this._playlist
  }

  getNextPlaylist() {
    return this._nextPlaylist
  }

  switchChannel(channel_id, play = true) {
    if (!this.canSwitchPlaylist('channel', channel_id)) {
      return
    }

    if (!isObjectId(channel_id)) {
      console.error("wrong channel id type", channel_id)
      channel_id = 0
    }

    var start = null
    var context = null

    if (isString(play)) {
      start = play
      var play = true
    } else if (isObject(play)) {
      var {
        start,
        context,
      } = play

      play = true
    }

    if (this.currentSong) {
      this.currentSong.set({
        isPlaying: false,
      })

      this.currentSong = null
    }

    this._playlist ? this._playlist.destroy() : undefined

    this._playlist = this.getChannel(channel_id, {
      start: start,
      context: context,
    })

    this.trigger("switch_channel")

    return this._playlist.fetch().then(channelModel => {
      if (play) {
        return this.getNextSong().then(theNextSong => {
          return this._switchSong(theNextSong)
        })
      }

      return null
    }, err => {
      return console.error("switch-channel-error" + err)
    })
  }

  switchSonglist(programme_id, play = true, position) {
    if (!this.canSwitchPlaylist('songlist', programme_id)) {
      return
    }

    var sidToPlay = null

    if (play && isNumber(parseInt(play))) {
      sidToPlay = play
      var play = true
    }

    var songlist = programme_id

    if (this._playlist && songlist && sidToPlay && (songlist === this._playlist.id || songlist.id === this._playlist.id)) {
      var songToPlay = this._playlist.get(sidToPlay)

      if (!songToPlay) {
        return Promise.reject("Song not in the playlist, do nothing")
      }

      this.logger.log(this.currentSong, this._playlist, "s")
      this._playlist.pushRecord(songToPlay.id)
      return this._switchSong(songToPlay)
    }

    if (programme_id instanceof Songlist) {
      if (this._playlist && this._playlist.id !== programme_id.id) {
        this._playlist.destroy()
      }

      this._playlist = programme_id

      if (!play) {
        return
      }

      if (sidToPlay) {
        songToPlay = this._playlist.get(sidToPlay)

        if (songToPlay) {
          this.trigger("switch_songlist")
          return this._switchSong(songToPlay, true, position)
        }
      }

      this.trigger("switch_songlist")
      return this.getNextSong().then(theNextSong => {
        return this._switchSong(theNextSong, true, position)
      })
    } else {
      if (!isObjectId(programme_id)) {
        return this.switchToFallbackChannel()
      }

      this._playlist ? this._playlist.destroy() : undefined
      this._playlist = this.getSonglist(programme_id)

      if (this.currentSong) {
        this.currentSong.set({
          isPlaying: false,
        })

        this.currentSong = null
      }

      this.trigger("switch_songlist")

      return this._playlist.fetch().then(programmeModel => {
        if (!play) {
          this.currentSong = this._playlist.get(this.currentSong.get("sid"))
          return Promise.reject('Song is already playing')
        }

        this.trigger("switch_programme", programmeModel)

        if (sidToPlay) {
          var currentSong = this._playlist.get(sidToPlay)

          if (currentSong) {
            return this._switchSong(currentSong, true, position)
          }
        }

        return this.getNextSong().then(theNextSong => {
          return this._switchSong(theNextSong, true, position)
        })
      }, err => {
        console.error("switch programme error" + err)
        return this.switchToFallbackChannel()
      })
    }
  }
  

  setVolume(volume) {
    if (volume > 100) {
      volume = 100
    } else if (volume < 0) {
      volume = 0
    }

    this.options.volume = volume
    return this.currentAudio.setVolume(volume)
  }

  getVolume() {
    return this.currentAudio.getVolume() || this.options.volume
  }
}