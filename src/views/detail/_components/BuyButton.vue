<template>
	<div class="d-box cloudPLR15" style="height:45px">		
        <div class="btn btnGary b-flex ta_c h_45" v-if="isSub">
			已购买
		</div>
	    <!-- 购买全书按钮 -->	    
		<div class="btn btnBlue b-flex ta_c" v-if="isShowBuyAll" @click="goBuyAll">
            <div class="reBtn">
                <i class="iconfont wf-paycar mr_5 c_fff"></i><span>购买全书</span>
            </div>
		</div>
		<!-- 章节收费按钮 -->
		<div class="btn btnGary b-flex ta_c h_45" v-if="isOnlyChapter">
			仅支持章节购买
		</div>
		<!-- 免费试听按钮 -->
		<div class="btn btnBlueH b-flex ta_c ml_15" v-if="hasFreeChapter" @click="goPlayer">
            <div class="reBtn">
			<i class="iconfont wf-listen mr_5 lightBlue"></i>
            <span>免费试听</span>
            </div>
		</div>
		<!-- 免费栏目按钮 -->
		<div class="btn btnGary b-flex ta_c h_45" v-if="isFree">
			免费栏目，随心听
		</div>
		<!-- 仅支持章节购买按钮 -->
		<div class="btn btnGary b-flex ta_c h_45" v-if="isOnlyChapterBuy">
			仅支持章节购买，点击收费章节进行订购
		</div>
	</div>	
</template>
<script type="text/javascript">    
 
    // import Purchase from 'UTILS/purchase'
    import audioServices from 'SERVICES/audioServices'
    
    export default {
        name: 'BuyButton',
        props: {
            item: {
            	type: Object,
            	required: true
            }
        },
        data() {
            return {
            	feeModel: this.item.feeModel,
                supportFirstSub: this.item.supportFirstSub,
                supportSecSub: this.item.supportSecSub,
                freedReadNum: this.item.freedReadNum,//免费章节数
                isLogin: false
            }
        },
        mounted() {
            this.$nextTick(function(){
                // this.isLogin = Auth.checkLogin();
            })
        	
        },
        methods: {
            goBuyAll () {
                let options = {
                    columnId: this.item.columnId
                }
                // if (this.isLogin) { //已登录
                //     Purchase.subscribeAudio(options);
                // } else {
                //     Auth.goLogin(true);
                // }
            },
            toPlayer () {
                //验证是否登录，第一章是否收费
                
                this.$router.push({
                    name: 'player',
                    query: {
                        columnId: this.item.columnId,
                        oid: 1
                    }
                })
            },
            goPlayer() {
                //验证是否登录，第一章是否收费
                let options = {
                    orderId: 1,
                    columnId: this.item.columnId
                }
                options.callback = (results) => {
                    if(results.resultCode == 0) {

                        let body = results.body;
                        this.audioDetail = body;
                   
                        // if (body.isLocked == 0 ) { //收费
                        //     if (this.isLogin) {  //是否登录
                        //        this.toPlayer();
                        //     } else {  //未登录，转登录加提示
                        //         Auth.goLogin(true);
                        //     }
                        // } else {
                            this.toPlayer();
                        // }
                    } else {
                       this.toPlayer();
                    }
                };

                audioServices.queryAudioDetail(options);
            }
        },
        computed: {
            isSub () {          //已购买
                return this.isLogin && this.item.sub == 1 && this.item.feeModel !=0;
            },
            isShowBuyAll () {   //全本购买
                
                if (this.isLogin && this.item.sub == 1) {
                    return false
                } else {
                    if (this.item.feeModel != 0&& this.item.supportFirstSub) { //支持全本购买
                        return true;
                    }
                    return false
                }
            },
            isOnlyChapter () { //仅支持章节购买
                if (this.isLogin && this.item.sub == 1) {
                    return false
                } else if (!this.item.supportFirstSub && this.item.supportSecSub && this.item.freedReadNum !=0) {
                    return true;
                }
                return false
            },
            hasFreeChapter () {  //免费试听
                //支持第一计费点或第二计费点
                if ((this.item.supportFirstSub || this.item.supportSecSub ) && this.item.freedReadNum != 0) { 
                    return true
                }
                return false;
            },
            isFree () {
                if (this.item.supportFirstSub == 0 && this.item.supportSecSub ===0) {
                    return true
                }
                return false;
            },
            isOnlyChapterBuy () {
                if (this.item.sub == 1) {
                    return
                } else if (!this.item.supportFirstSub && this.item.supportSecSub&& this.item.freedReadNum ==0) {
                    return true
                }
                return false;
            }
        }
    }
</script>