<template>
  <div class="hello">
    <h1>{{ msg }}</h1>  
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
      this._soundURL = null
      let onReadyCallback = () => {    
        this._smReady = true
        if (this._soundURL) {
          this.play(this._soundURL)
          this._soundURL = null
        }
      }
      var swfurl = '../../assets/swf/';
      console.log(swfurl)
      domready(()=>{
        let options = Object.assign({
          allowScriptAccess: 'always',
          url: swfurl,
          useHTML5Audio: true,
          preferFlash: false,
          waitForWindowLoad: false,
          debugMode: true,
          flashVersion: 9,
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
   
        soundManager.setup(options);
        let url = 'http://tyst.migu.cn/public%2Fproduct04%2F2017%2F10%2F11%2F2017%E5%B9%B410%E6%9C%8809%E6%97%A516%E7%82%B936%E5%88%86%E7%B4%A7%E6%80%A5%E5%86%85%E5%AE%B9%E5%87%86%E5%85%A5SONY320%E9%A6%96%2F%E5%85%A8%E6%9B%B2%E8%AF%95%E5%90%AC%2FMp3_40_16_16%2F%E4%B8%80%E7%94%9F%E6%89%80%E7%88%B1-%E8%8E%AB%E6%96%87%E8%94%9A.mp3'
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
