import "@/libs/soundmanager2"
import isFunction from "lodash/isFunction"

const DEFAULT_VOLUME = 50;
const AudioId = 'mpost-audio';
const fun = function () {};

class Audio {
    static RequiredFunctions = [
	    'onplay', 'onpause', 'onSuspend','onresume', 'onFinish', 'whileloading', 'whileplaying',
	    'loadNextSong'
	]
	constructor(options, settings) {
        
        let smOptions = settings.smOptions || {};

        options = Object.assign(options, {
	        timeout: parseInt(options["audio_timout_time"]) || 10000,
	        lagTime: parseInt(options["audio_lag_time"]) || 20000,
	        maxLagCount: parseInt(options["audio_max_lag_count"]) || 100,
	        retryWaitime: 2000,
	        maxErrorLimit: 3,
	    });

        for (let key of Audio.RequiredFunctions) {    
		    if (!options[key]) {
		        console.warn('DOUAUDIO: missing option', key)
		        options[key] = fun
		    } else if (isFunction(options[key])) {
		        options[key] = options[key].bind(null, this)
		    }
	    }

        this._smReady = false;
        this._soundURL = null;
        this.options = options;
        // debugger
        let onReadyCallback = () => {        	     
	        this._smReady = true
		    if (this._soundURL) {
		        this.play(this._soundURL)
		        this._soundURL = null
		    }
	    }
        let setOptions = {
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
		        this.log('init soundmanager2 failed')
		        if (!soundManager.setupOptions.preferFlash) {
		            soundManager.setup({
		                preferFlash: true,
		                onready: onReadyCallback,
		            }).reboot()
		        }
		    }
        }        

        setOptions = Object.assign(setOptions, smOptions);
        soundManager.setup(setOptions);
	}
    /**
     * [initAudio 初始化Audio]
     * @param  {[type]} url [播放地址]
     * @return {[type]}     [description]
     */
	initAudio(url) {
        if(this.audio) {
            this.audio.destruct(); //已存在则destruct销毁
        }
        
        let CSMoptions = {
            url: url,
            id: AudioId,
            autoLoad: false,
            autoPlay: false,
            from:  null,
            loops: 1,
            onplay: () => {
                this.checkPlayingTimeout();
                this.options.onplay();
            },
            onpause: () => {
            	this.clearChecker();
                this.options.onpause();
            },
            onresume: () => {
            	this.checkPlayingTimeout();
                this.options.onresume();
            },
            onfinish: () => {
                this.clearChecker();
                return this.options.onFinish();
            },
            onsuspend: this.onSuspend.bind(this),
		    whileloading: this.onWhileLoading.bind(this),
		    whileplaying: this.onWhilePlaying.bind(this),
		    onposition: null,
		    position: null,
		    stream: true,   
		    volume: this._volume
        }

        this.audio = soundManager.createSound(CSMoptions);

        return this.audio;
	}
	/**
	 * [reloadAudio 重新播放]
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
    reloadAudio(url) {
	    if (!this.audio) {
	      this.log('audio 不存在')
	      return
	    }

	    if (!url) {
	      url = this.audio.url
	    }
	    console.log('reloadAudio')
	    this.unloadAudio()
	    this.play(url)
	}
	/**
	 * [unloadAudio 销毁audio]
	 * @return {[type]} [description]
	 */
	unloadAudio() {
		
	    this.audio.pause()
	    soundManager.destroySound(this.AudioID)
	    this.audio = null
	}
	/**
	 * [play 播放]
	 * @param  {[type]} url      [description]
	 * @param  {[type]} position [description]
	 * @return {[type]}          [description]
	 */
    play(url, position=null) {
        // this.clearChecker()
	    // use in whileloading, set this to true when a sound is 100% loaded
	    this._isFinishLoaded = false
	    this.log('play: '+ url)

	    if (!this._smReady) {
	        this._soundURL = url
	        this.log('soundmanager 未初始化完成，稍等')
	        return
	    }

	    if (!this.audio) {
	        this.initAudio(url)
	    }

	    this.audio.stop();
	    this.audio.play({
	        url: url,
	        position: position,
	        onload: (success) => {
		        if (success) {
		        	this.log('audio: 加载完成')
		            this.options.onload();
		        } else {
		        	this.log('audio: 加载失败')
		            return this.onLoadError()
		        }
		        this.errorCount = 0
	        },
		    onfailure: () => {
		        this.log('[flashmode] audio: 加载失败')
		        return this.onLoadError()
		    }
        })

        this.checkPlayingTimeout(this.options.timeout)
    }
    //播放/暂停
    togglePause() {
	    if (!this.audio) {
	      return this.options.onFinish()
	    }
	    this.audio.togglePause()
	}
    //设置音量
	setVolume() {
        this._volume = value
	    if (!this.audio) {
	      return soundManager.setVolume(value)
	    }
	    return this.audio.setVolume(value)
	}
    //获取音量
    getVolume() {
        if (this.audio) {
	        return this.audio.volume
	    }
	    return this._volume
    }
    //设置进度（位置）
    setPosition(position) {
        if (position < 0) {
	        position = this.audio.duration + position
	    }
	    this.audio.setPosition(position)
    }
    
    onWhilePlaying() {
	    this.checkPlayingTimeout()
	    this.checkPlayerPosition()
	    this.options.whileplaying()
	}
	onSuspend() {
		this.options.onSuspend()
	}
	onWhileLoading() {
		// debugger
	    this.options.whileloading()

	    if (this._isFinishLoaded) {
	        return
	    }
        if (this.audio) {
            let loadingPercent = this.audio.bytesLoaded / this.audio.bytesTotal
		    if (loadingPercent > 0.99) {
		        if (this.audio.position / this.audio.duration < 0.8) {
		            this._isFinishLoaded = true
		        }
		    }
        }
	}
    /**
     * [clearChecker 清理是否超时检测]
     * @return {[type]} [description]
     */
    clearChecker() {   
	    this._lastPosition = null
	    this._lagCount = 0
	    if (this.isPlayingChecker) {
	      window.clearTimeout(this._isPlayingChecker)
	      this._isPlayingChecker = null
	    }
	}
	/**
	 * [checkPlayingTimeout 检测播放是否超时]
	 * @return {[type]} [description]
	 */
    checkPlayingTimeout(timeout) {
        if (!timeout) {
	        timeout = this.options.timeout
	    }

	    if (this._isPlayingChecker) {
	        window.clearTimeout(this._isPlayingChecker)
	    }

	    this._isPlayingChecker = window.setTimeout((checkerTime) => {
	        if (checkerTime) {	       
	            if (Date.now() - checkerTime < timeout) {
	                return
	            }
	        }

		    if (!this.isPlaying()) {
		        return
		    }

	        this._isPlayingChecker = null
	    }, timeout, Date.now())
     
    }
    /**
     * [checkPlayerPosition 检测播放位置(进度)]
     * @return {[type]} [description]
     */
    checkPlayerPosition() {
    	//验证是否处在播放状态
        if (!this.isPlaying()) {
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
		    
		    if (diff > this.options.lagTime) {
		        this.log('timediff: '+ diff)
		        if (this._lagTotal) {this._lagTotal += diff}

		        if (this._lagTotal > this.options.timeout) {
		            this.log('加载文件超时...')
		        }

		        if (!this._lagCount) {
		        	this._lagCount = 0
		        }
		        this._lagCount += 1
		        if (this._lagCount >= this.options.maxLagCount) {
		            this.log('文件太大超过最大限制...')
		        }
		      }
	    }

	    this._lastPosition = {position, time: now}
    }
    
    /**
     * [isPlaying 检测audio播放状态]
     * readyState: 
     *    0 : uninitialised  1 : loading
	      2 : failed/error   3 ： loaded/success
     * @return {Boolean} [description]
     */
    isPlaying() {
	    if (!this.audio) {
	      return false
	    }

	    return !this.audio.paused
	}

    log(msg) {
        return console.log(msg);   
    }
    
    /**
     * [onLoadError 加载失败处理]
     * @return {[type]} [description]
     */
    onLoadError() {
	    if (!this.errorCount) {
	      this.errorCount = 0
	    }
	    this.errorCount += 1

	    if (this.errorCount > this.options.maxErrorLimit) {
	      this.log('Max error times reached, skip song')	    
	      this.errorCount = 0
	      // return this.loadNextSong()
	      return this.options.onLoadError();
	    }

	    this.log('Audio Load Error, retry after 2 seconds')

	    this.retryHandler = window.setTimeout(() => {
	      this.retryHandler = null
	      this.log('Retrying:', this.errorCount)
          this.log('重试加载音频文件，次数:', this.errorCount)
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
	    return this.options.loadNextSong()
	}
}

export default Audio