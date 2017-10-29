<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <!-- <video src="http://mr1.doubanio.com/c57ad652df5d79895f3a4bf803365b6b/0/fm/song/p1612191_64k.mp3"  width="320" height="240" controls autobuffer ></video> -->
  </div>
</template>
<script>

import {soundManager} from "soundmanager2"
import domready from "domready"

export default {
  name: 'Player',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted() {
    this.$nextTick(function(){

      let soundManagerOptions = {};
      this._smReady = false

      // set sound url when unload
      this._soundURL = null

      let onReadyCallback = () => {
        // set flag to true
        this._smReady = true

        if (this._soundURL) {
          this.play(this._soundURL)
          this._soundURL = null
        }
      }
      
      domready(()=>{
        let options = Object.assign({
          allowScriptAccess: 'always',
          url: './swf/',
          useHTML5Audio: true,
          preferFlash: false,
          waitForWindowLoad: false,
          debugMode: true,
          flashVersion: 8,
          useHighPerformance: true,
          forceUseGlobalHTML5Audio: true,
          onready: onReadyCallback,
          defaultOptions: {
            volume: 50,
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
        }, soundManagerOptions);
        
        console.log(options.url)
        soundManager.setup(options);
        let url = 'http://mr1.doubanio.com/c57ad652df5d79895f3a4bf803365b6b/0/fm/song/p1612191_64k.mp3'
        let audio = this.initAudio(url);
        
        audio.play({
          url: url,      
          onload: (success) => {
            if (!success) {
              console.log('audio: audio load failure')
             
            }
          },
          onfailure: () => {
            console.log('[flashmode] audio: audio load failure')          
          }
        })
      })
      
    });
  },
  methods: {
    initAudio(url) {
      let audio = soundManager.createSound({
          'url': url,
          'id': 'auto',
          'autoLoad': false,
          'autoPlay': false,
          'from': null,
          'loops': 1,
          'onplay': () => {            
            // this.options.onplay() // douradio.trigger('play')
          },
          'onpause': () => {          
            // this.options.onpause() // douradio.trigger('pause')
          },
          'onresume': () => {         
            // this.options.onresume() // douradio.trigger('resume')
          },
          'onfinish': () => {          
            // return this.options.onFinish()
          },       
          'onposition': null,
          'onstop': null,    
          'multiShot': false,
          'multiShotEvents': false,
          'position': null,   
          'stream': true,
          'volume': 50,
        })

      return audio;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
