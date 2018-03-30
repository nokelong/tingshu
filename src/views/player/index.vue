<template>
    <div class="player">       
        <top-header :pageName="filterPageName" :backType="playBack">
            <a class="btnBox  c_fff mt_12" href="javascript:;" v-if="inBookShelf" @click="goUcenter">
                <i class="iconfont wf-myAudio c_fff fz_20 mr_10"></i>
            </a>
            <a class="btnBox  c_fff mt_12" href="javascript:;" v-else @click="addBooks">
                  <i class="iconfont wf-addBook c_fff fz_20 mr_10"></i>
            </a> 
            <a class="btnBox  c_fff mt_12" href="javascript:;" @click="goHome">
                  <i class="iconfont wf-home c_fff fz_20"></i>  
            </a>
        </top-header>     
       <section  class="play-warp">
            <div class="playDetailBtn" @click="goDetail">
                <i class="iconfont wf-detail"></i>
            </div>
            <!-- 播放主体-->
            <div class="playBox" >
                <div class="clip-path":class="{bounce:isPlaying}" >
                    <img :src="audioDetail.coverImg" style="width:100%">
                </div>
                <div class="bg_borderFFF"></div>
            </div>
            <div class="playTitle ta_c">
                <h3>第{{audioDetail.orderId}}章 | {{filterTitle}}</h3>
                <h4>主播：{{filterReaderName}}</h4>
            </div>
            <!-- 进度条 -->
            <div class="playBar-warp d-box">
                <span class="c_darkGray">{{progress}}</span>
                <div class="playBar b-flex" @mousemove.prevent="handleMouse($event)" @touchmove.prevent="handleMouse($event)"> 
                    <div class="bar" ref="progressTrack"> 
                        <span class="bar-unfill"> <span class="bar-fill" :style="{width:progressWidth}"></span> </span> 
                    </div> 
                    <i class="icon i-playIconC" :style="{left:progressLeft}"></i>
                </div>
                <span class="c_darkGray">{{totalPlayTime}}</span>
            </div>         
            <div class="playOperationBox">
                <ul class="d-box playBg_eee">
                    <li class="replayBtn b-flex">
                        <div>
                            <i class="iconfont wf-replay lightBlack" @click="onreload">
                            </i>
                        </div>
                    </li>                  
                    <li class="upBookBtn b-flex" id="prev" >
                        <div @click="loadPrevSong">
                            <i class="iconfont wf-Fastforward" :class="filterPrevClass"></i>
                        </div>
                    </li>
                    <li class="playBtn b-flex">
                        <div class="playBtn-Bg" v-if="isPlaying" @click="pause">
                            <div class="playBtn-Bb">        
                                <i class="iconfont wf-play lightBlue"></i>
                            </div>
                            <div class="playbuffer" v-if="isloading">
                                <img src="../../assets/images/playbuffer.png" :class="{bounce:isloading}">
                            </div>
                        </div>
                        <div class="playBtn-Bg" v-else @click="play">
                            <div class="playBtn-Bb"> 
                              <i class="iconfont wf-suspend lightBlue"></i>
                            </div>
                        </div>
                    </li>
                    <li class="downBookBtn b-flex" id="next">
                        <div @click="loadNextSong">
                            <i class="iconfont wf-slowMotion " :class="filterNextClass"></i>
                        </div>
                    </li>
                    <li class="CatalogBtn b-flex" id="catalog" >
                        <div @click="goCatalog">
                            <i class="iconfont wf-Catalog lightBlack" ></i>
                        </div>
                    </li>
                </ul>
            </div>          
        </section>
        <audio  id="mpostAudio"  :src="songUrl" autoplay="autoplay" preload="preload" controls="controls">
        </audio>
    </div>
</template>
<script type="text/javascript">
    
    import domready      from "domready"
    import Audio         from 'PLUGINS/Audio'
    import Platform      from 'PLUGINS/Platform'
    import Confirm       from 'PLUGINS/Confirm'  
    import TopHeader     from 'COMPONENTS/TopHeader'
    import AudioUtil     from 'UTILS/audioUtil'   
    import audioServices from 'SERVICES/audioServices'
    import Tips          from 'UTILS/tips'
   

    const START_TIME = '00.00'

    export default {
        name: 'player',
        components:{TopHeader},
        data() {
            return {
                orderId: 0,
                columnId: "",
                currentAudio: {},              
                audioDetail:{}, 
                audio: null,
                songUrl: "",
                isPlaying: true,
                totalPlayTime: START_TIME,
                progress: START_TIME,
                progressLeft: 0,
                progressWidth: 0,              
                isLogin: false,
                isloading:true,
                isAutoPlay: true,
                isLastChapter: 1,  //是否最后一章:0 是;1 否
                isAudioInit: false,
                isLocked: 1, //是否锁 0：锁定 1：未锁定
                currentPageNum: "",
                maxLength: 18,
                readerNameLength: 20,
                nextOrprev: 1,  //1：next; 0 prev
            }
        },        
        mounted() {
            this.$nextTick(function() {
                let query = this.$route.query;
                this.orderId  = query.oid;
                this.columnId = query.columnId;
                if (query.pageNum) {
                    this.currentPageNum = query.pageNum;
                }
                
                // this.isLogin = Auth.checkLogin();
                this.queryAudioDetail();
            });
        },
        methods: {
            domReady() {
                
                let self = this;
                //播放配置
                let soundManagerOptions = {
                    smOptions: {
                        debugMode: true //是否开启调试模式
                    }
                };

                domready(()=>{
                    self.currentAudio = new Audio(self, soundManagerOptions);
                    self.currentAudio.play(self.songUrl);
                    self.audio = self.currentAudio.audio;

                    if (Platform.iOS) {
                        self.isPlaying = false;
                        self.isAutoPlay = false;
                    }              
                    this.isAudioInit = true;                    
                })
            },
            pause() {
                let audio = this.currentAudio.audio;    
                if (audio && audio.readyState) {
                    audio.pause();
                    this.isPlaying = false;
                }
            },
            play() {  
                console.log('this.songUrl ' + this.songUrl)
                //自动播放
                if (!this.isAutoPlay) {  
                    this.isPlaying = true;
                    this.isAutoPlay = true;
                    // this.currentAudio.play(this.songUrl);
                    return
                } else {
                    this.isPlaying = !this.isPlaying;
                    this.currentAudio.togglePause()
                }
            },
            onSuspend () { //暂停               
                if (this.progressLeft !=100) {  //未加载完
                    // this.isloading = true;
                }
            },
            onreload() {  //重置
                this.currentAudio.reloadAudio();
                this.currentAudio.play(this.songUrl);
                this.isPlaying = true;              
            },
            onFinish() {
                console.log('播放结束---onFinish');
                this.isPlaying = false;
                this.loadNextSong();
            },
            onload () {
                
                let audio = this.currentAudio.audio;
                let duration = audio.duration || this.audioDetail.chapterTime*1000;
                
                this.totalPlayTime = AudioUtil.convertDurationTime(duration);
                this.isloading = false;
                console.log('加载完成onload' )
            },
            whileplaying () {  //播放中钩子方法
                
                let progressMaxLeft = 100, left, width;
                let audio = this.currentAudio.audio,
                position = this.audio.position,
                durationEstimate = this.audio.durationEstimate;

                left = Math.min(progressMaxLeft, Math.max(0, (progressMaxLeft * (position / durationEstimate)))) + '%';
                width = Math.min(100, Math.max(0, (100 * (position / durationEstimate)))) + '%';
                
                // if (this.audio.duration) { //更新播放进度
                    this.progressWidth = width;
                    this.progressLeft = left;                     
                    this.progress = AudioUtil.convertDurationTime(position)
                // }
            },
            whileloading () {  //加载中钩子方法
                // let audio = this.currentAudio.audio;
                if (!this.audio.isHTML5) {
                    let durationEstimate = this.audio.durationEstimate;
                    this.totalPlayTime = AudioUtil.convertDurationTime(durationEstimate);
                   this.isloading = true;
                }
            },
            handleMouse (e) { //拖动改变播放进度

                var target, barX, barWidth, x, clientX, newPosition, sound;
                let audio = this.currentAudio.audio;
                target = this.$refs.progressTrack;

                barX = AudioUtil.getOffX(target);
                barWidth = target.offsetWidth;
                clientX = AudioUtil.getClientX(e);
                x = (clientX - barX);
                newPosition = (x / barWidth); 
                var duration = this.audioDetail.chapterTime*1000;
                console.log(duration)
                console.log( audio.duration)
                
                if (audio && duration) {
                    audio.setPosition(duration * newPosition);
                     
                    // a little hackish: ensure UI updates immediately with current position, even if audio is buffering and hasn't moved there yet.
                    if (audio._iO && audio._iO.whileplaying){
                        audio._iO.whileplaying.apply(audio);
                        this.isloading = true;
                    } else {
                        this.isloading = false;
                    }
                }
                return false;
            },
            queryAudioDetail(next) {
                
                let options = {
                    orderId: this.orderId,
                    columnId: this.columnId
                }
                options.callback = (results) => {
                    if(results.resultCode == 0) {

                        let body = results.body;
                        this.audioDetail = body;
                        
                        let duration = body.chapterTime;
                        this.totalPlayTime = AudioUtil.convertDurationTime(duration);
                        // if (body.isLocked == 0 ) { //收费
                        //     if (this.isLogin) {  //是否登录
                        //         let param = {
                        //             orderId: this.orderId,
                        //             columnId: this.columnId
                        //         }
                        //         //提示取消按钮事件
                        //         param.cancel = () => {
                        //             if (this.nextOrprev ==1 && this.orderId > 1) {  //next
                        //                 this.orderId --;
                        //                 console.log('cancel next')
                        //             } else {  //prev
                        //                 if (this.isLastChapter==1){
                        //                     this.orderId ++;
                        //                     console.log('cancel prev')
                        //                 }
                        //             }
                        //             this.isPlaying = false;
                        //             this.isloading = true;
                        //             this.switchSong();
                        //         }
                        //         Purchase.subscribeAudioConfirm(param)
                              
                        //     // } else {  //未登录，转登录加提示
                        //     //     Auth.goLogin(true);
                        //     // }
                        // } else {
                            this.songUrl = body.chapterurl;
                            this.isLastChapter = body.isLastChapter;
                            //是否初始化
                            if (!this.isAudioInit) { 
                                this.domReady();
                            } 
                            if(next) {
                                next()
                            }
                        // }
                    } else {
                        Tips.showTips({
                            type: 'error',
                            msg: '操作失败，请稍后重试'
                        })
                    }
                };

                audioServices.queryAudioDetail(options);
            },
            loadPrevSong () {  //上一首
                if(this.orderId > 1) {
                    this.orderId --;
                    this.isPlaying = false;
                    this.isloading = true;
                    this.nextOrprev = 0;
                    this.switchSong();
                }
            },
            loadNextSong () {  //下一首                
                if (this.isLastChapter==1) {
                    this.orderId ++;
                    this.isPlaying = false;
                    this.isloading = true;
                    this.nextOrprev = 1;
                    this.switchSong();
                }
            },
            onLoadError () { //加载失败
                
                let self = this;
                let template = 'TT~第'+this.orderId+'章节播放失败，请另选章节收听';
                let confParams = {
                    template: template,
                    menuInfo: [{
                        value: "确认",
                        type: "warning",
                        event: function() {
                            self.goCatalog();
                            confrim.close();
                        }
                    }, {
                        value: "重试",
                        type: "normal",
                        event: function() {
                            self.onreload()
                            confrim.close();
                        }
                    }]
                }

                var confrim = new Confirm(confParams); 
            },
            switchSong (position) {
                this.queryAudioDetail(() => {
                    position = position  || 0;
                    this.totalPlayTime = START_TIME;
                    this.progress = START_TIME;
                    this.progressWidth = 0;
                    this.progressLeft = 0;  
                    this.isPlaying = true;
                    this.currentAudio.play(this.songUrl, position)
                })
            },
            goDetail () {  //进详情页
                this.$router.push({
                    name:'audiodetail',
                    query:{columnId:this.columnId}
                });
            },
            goCatalog () { //进目录页
                this.$router.push({
                    name: "audiocatalog",
                    query: {
                        columnId:this.columnId,
                        orderId: this.orderId,
                        pageNum: this.currentPageNum
                    }
                })
            }
        },
        computed: {
            filterNextClass () {
                if (this.isLastChapter==0) {
                    return 'c_e8e8e8'
                }
                return 'lightBlack'
            },
            filterPrevClass () {
                 
                if (this.orderId ==1) {
                    return 'c_e8e8e8'
                }
                return 'lightBlack'
            },
            filterTitle () {
                let title = this.audioDetail.title;
                if (!title) return;             
                let txt = title.slice(0, this.maxLength);
                
                if (title.length > this.maxLength) {
                    txt += '...';
                }
                return txt;
            },
            filterReaderName () {
                let readerName = this.audioDetail.readerName;
                
                if (!readerName) return;             
                let txt = readerName.slice(0, this.readerNameLength);
                
                if (readerName.length > this.readerNameLength) {
                    txt += '...';
                }
                return txt;
                
            }
        },
        destroyed () {            
            if (this.currentAudio && this.currentAudio.unloadAudio) {
                console.log('destroyed...')
                this.currentAudio.unloadAudio();
            }
        }
    }
</script>
<style type="text/css">
   .bounce {
      animation: bounce-in 5s linear infinite;
    }
  
    @keyframes bounce-in {
        0% {
          transform: rotate(0deg);
        }    
        100% {
           transform: rotate(360deg);
        }
    }
</style>