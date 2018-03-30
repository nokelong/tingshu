<template>
	 <li @click="goReader(item)" :class="{FwBlue: currentItem}" :data-pagenum="item.currentPageNum">
    	<a href="javascript:;" class="d-box">
    		<!-- c_gray为灰显状态 -->
    		<i class="iconfont wf-playing lightBlue" v-if="currentItem"></i>
    		<i class="iconfont wf-suspending" v-else></i>
    		<div class="b-flex c_gray">第{{item.orderId}}章 {{filterTitle}}</div>
        <div class="mr_10" v-if="item.isLocked==0">
            <span class="c_red chapterNumRed">{{item.price}}元/章</span>
        </div>
    		<i class="iconfont wf-lock" v-if="item.isLocked==0"></i>
    	</a>
    </li>
</template>
<script type="text/javascript">
    
    // import Auth     from 'UTILS/auth'
    // import Purchase from 'UTILS/purchase'
    import Utils    from 'UTILS/utils'

    export default{
   	    name: 'Catalog',
   	    data() {
   	    	return {
   	    	    isRead: false,
              isLogin: false,
              stringMaxLength: {
                  '320': 12,
                  '375': 16,
                  '414': 19,
                  '768': 30          
              },
   	    	}
   	    },
   	    props: {
   	  	    item: {
   	  		      type:Object,
   	  		      required:true
   	  	    },
   	  	    curentOid: {
   	  	    	  default: 0,
                required: false
   	  	    },
            currentPageNum: {
                type: [Number, String]
            }
   	    },
        mounted() {
            this.$nextTick(function(){
                this.isLogin = Auth.checkLogin();
            });
        },
        methods: {
            goReader(item) {

                let options = {
                    columnId: this.item.columnId,
                    orderId: this.item.orderId
                }
                
                // if (this.item.isLocked == 0) { //是否收费
                //     if (this.isLogin) {  //已登录
                //         Purchase.subscribeAudio(options);
                //     } else {
                //         Auth.goLogin(true);
                //     } 
                // } else {       //免费章节
                    this.$router.push({
                        name: 'player',
                        query: {
                            columnId: item.columnId,
                            oid: item.orderId,
                            pageNum: item.currentPageNum
                        }
                    });
                // }
            }
        },
        computed: {
            currentItem () {            	
            	  return this.curentOid == this.item.orderId            	 
            },
            filterTitle () {

                let tit = this.item.title;
                // tit = '高人相帮入室驱鬼入室驱鬼入室驱鬼入室驱鬼'
                if (!tit) return;              
                let winWidth = document.body.scrollWidth;
                let maxSize = this.stringMaxLength[winWidth] || 8;
                let oidSize = String(this.item.orderId).length;

                if(this.item.isLocked == 0) {
                    maxSize -= 4;
                }
                
                if(oidSize >2) {
                  maxSize = maxSize + 2 - oidSize ;
                }
                let name = tit.slice(0, maxSize);                
                if (Utils.getStringlen(tit)/2 > maxSize) {
                    name += '...';
                }
                return name;
            }
        }
    }
</script>