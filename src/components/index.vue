<template>
	<div class="player">	   
	    <div @click="start" ref="playBtn">start</div>
        <h1>在iOS自动播放 HTML5 audio的正确方式</h1>  
        <br>
        <audio id="bgmusic" src="http://tyst.migu.cn/public/product03/2017/09/17/2017%E5%B9%B403%E6%9C%8808%E6%97%A509%E7%82%B937%E5%88%86%E5%86%85%E5%AE%B9%E5%87%86%E5%85%A5%E5%8D%8E%E5%A4%8F%E5%8A%A8%E5%A3%B01%E9%A6%96/%E5%85%A8%E6%9B%B2%E8%AF%95%E5%90%AC/Mp3_320_44_16/%E5%88%9A%E5%A5%BD%E9%81%87%E8%A7%81%E4%BD%A0-%E6%9D%8E%E7%8E%89%E5%88%9A.mp3" autoplay preload controls style="width:80%;"></audio>
	</div>
</template>
<script type="text/javascript">

    import {soundManager} from "soundmanager2"
    import domready from "domready"
    import Audio   from './audio'
    import Tis     from 'UTILS/Tis'  

    export default {
        name: 'player',
        data() {
            return {
            	currentAudio: {},
            	songUrl :'http://tyst.migu.cn/public/product03/2017/09/17/2017%E5%B9%B403%E6%9C%8808%E6%97%A509%E7%82%B937%E5%88%86%E5%86%85%E5%AE%B9%E5%87%86%E5%85%A5%E5%8D%8E%E5%A4%8F%E5%8A%A8%E5%A3%B01%E9%A6%96/%E5%85%A8%E6%9B%B2%E8%AF%95%E5%90%AC/Mp3_320_44_16/%E5%88%9A%E5%A5%BD%E9%81%87%E8%A7%81%E4%BD%A0-%E6%9D%8E%E7%8E%89%E5%88%9A.mp3'
            }
        },
        mounted() {
            this.$nextTick(function() {
                
                let soundManagerOptions = { 
				    debugMode: true
				};

			    domready(()=>{

			        this.currentAudio = new Audio(this, soundManagerOptions);
				    // this.currentAudio.play(this.songUrl);
                    
                    let tis = new Tis();                    
				    if(!!tis.iOS) {
                        // console.log('-----iOS------')
                        // var video=document.getElementById('bgmusic');
                        // video.setAttribute('muted','muted');
                        // video.setAttribute('playsinline','playsinline');
                        // video.setAttribute('webkit-playsinline','webkit-playsinline');
                        // video.play();
                    }
                    // window.onload = (function() {
                    //     console.log('-----attemp to onload-----')
                    //     // this.$refs.playBtn.click();
                    //     var el = this.$refs.playBtn;
                    //     var event = document.createEvent('Events');
                    //     event.initEvent('click', true, true); 
                    //     el.dispatchEvent(event); 
                    //     this.$refs.playBtn.click()
                    // }).bind(this);
                    // this.autoPlayAudio();
                    // var voiceStatu = true;
                    // document.addEventListener("touchstart",function(e){
                    //     if(voiceStatu){
                    //         this.$refs.playBtn.click();
                    //         voiceStatu = false;
                    //     }
                    // }, false);
                    
                    
                 
			    })
            });
        },
        methods: { 
            start() {
                alert('start')
            	this.currentAudio.play(this.songUrl)
            },
            togglePause() {
            	return this.currentAudio.togglePause()
            },
            autoPlayAudio() {
             
               function autoPlayAudio1() {
                    wx.config({
                        // 配置信息, 即使不正确也能使用 wx.ready
                        debug: false,
                        appId: '',
                        timestamp: 1,
                        nonceStr: '',
                        signature: '',
                        jsApiList: []
                    });
                    wx.ready(function() {
                        document.getElementById('bgmusic').play();
                    });
                }
                // 方法2: "野生"方法, 借用原来老的 WeixinJSBridge
                function autoPlayAudio2() {
                    window.onload = function() {
                        // alert(typeof WeixinJSBridge);
                        WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
                            // 在这里拿到 e.err_msg, 这里面就包含了所有的网络类型
                            // alert(e.err_msg);
                            document.getElementById('bgmusic').play();
                        });
                    };
                }
                
                autoPlayAudio2(); // 推荐使用方法1
            }
        }
    }
</script>
<style scope>
  .player {
  	 font-size: 3rem
  }
</style>