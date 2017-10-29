import Douradio from "douradio/init"
import reqwest from "reqwest"
import domready from "domready"
import Backbone from "backbone"

// let config = (window.bootstrap && window.bootstrap.config) || {}
let audioConfig = Object.assign({
  "audio_timout_time":10000,
  "audio_lag_time":1000,
  "audio_max_lag_count":4,

  // soundmanager options
  soundmanager: {
    url: '/swf/soundmanager2/',
    preferFlash: false,
    useHTML5Audio: true,
    debugMode: false,
    consoleOnly: true,
    flashVersion: 9,
    useHighPerformance: true,
  },
}, (window.bootstrap && window.bootstrap.config) || {})

let douradio = new Douradio({
  ajax: reqwest,
  domready: domready,
  Events: Backbone.Events,
  apiroot: '/j/v2/',
  audio: audioConfig,
  autoplay: true,
  authinfo: (window.bootstrap && window.bootstrap.current_user) || {},
})

// set a custom ajax client
Backbone.ajax = reqwest
Backbone.sync = (method, model, options) => { console.info(method, model, options) }

window.dr = douradio

export default douradio



// WEBPACK FOOTER //
// ./src/douradio.js