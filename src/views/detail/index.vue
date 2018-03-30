<template>
	<div class="detail">
		<top-header :pageName="filterPageName">
            <a class="btnBox  c_fff mt_12" href="javascript:;" v-if="isBookShelf" @click="goUcenter">
                我的听书
            </a>
            <a class="btnBox  c_fff mt_12" href="javascript:;" v-else @click="addBooks">
                加入听书
            </a>
        </top-header>
		<section class="novelDetails_buy listenDetailBox bm_d9 ">
			<div class="NovelShelf_List cloudPLR15 bm_none">
				<ul>
					<li class="d-box">
						<aside class="NovelShelfImg">
						  <img :src="column.columnImageUrl" :onerror="defaultImg">
						</aside>
						<div class="b-flex ml_10">
							<h3 class="NovelList-title">{{filterName}}</h3>
							<div class="from mt_8">
								<h4>作者：{{filterAuther}}</h4>
								<h4 class="mt_3">主播：{{filterReaderName}}</h4>
								<h4 class="mt_3">价格：<span class="c_red">{{filterPrice}}</span>{{filterUnit}} | 时长：{{column.totalChapterTime}}</h4>
								<h4 class="mt_3">章节：共{{column.totalChapter}}章 |
									<span class="c_fec05b ml_5"v-if="column.isEnd ==1">>已完结</span>
									<span class="c_fec05b ml_5"v-else>>连载中</span>
								</h4>
								<h4 class="mt_3">分类：<span class="c_fec05b">{{column.categoryName}}</span>
									<i class="iconfont wf-suspend ml_5"></i>{{filterCount}}
								</h4>
							</div>
						</div>
					</li>
				</ul>
			</div>
			<buy-button :item="column"></buy-button>
    	</section>
        <!--目录-->
    	<catalog-box :column="column" ref="catalogBox">
        </catalog-box>
        <section class="listImgBox bg_white pb_15 bt_d9" v-if="relatNovels.length >2">
            <div class="titleBox d-box cloudPLR15">
                <span class="blueblock mr_5 mt_13"></span>
                <span class="b-flex fz_14 lightBlack">关联推荐</span>
            </div>
            <div class="ImgList cloudPLR15">
                <ul class="d-box">
                    <audio-info v-for="(item, index) in relatNovels" :novel="item" :key="item.columnId"></audio-info>
                </ul>
            </div>
        </section>
	</div>
</template>
<script type="text/javascript">

    import defaultImage  from  'IMAGES/DefaultListenImg175.png'
    import TopHeader     from  'COMPONENTS/TopHeader'    
    import AudioInfo     from  'COMPONENTS/AudioInfo'
    import BuyButton     from  './_components/BuyButton'
    import CatalogBox    from  './_components/CatalogBox'    
    import AudioServices  from  'SERVICES/audioServices'
   
    import Utils         from  'UTILS/utils'
    import Tips          from  'UTILS/tips'

    export default {
    	name: 'detail',
    	components: {TopHeader, CatalogBox, AudioInfo, BuyButton},
    	data() {
    		return {
    			pageName:'栏目详情',
    			defaultImg:'this.src="' +defaultImage + '"',
    			columnId:0,
	            contentType: 7,                
	           	column:{
	                longDescription:""
	            },	            
	            relatNovels:[],
                isLogin: false,
                inBookShelf: 0,
                maxLength: {
                    '320': 12,
                    '375': 16,
                    '414': 22,
                    '540': 24, //huawei p8
                    '768': 28          
                },
                stringMaxLength: {
                    '320': 11,
                    '375': 16,
                    '414': 19,
                    '540': 24,
                    '768': 30          
                }             
    		}
    	},
        watch: {
            // 如果路由有变化，会再次执行该方法
            '$route': 'fetchData'
        },
    	mounted () {
		    this.$nextTick(function(){
		        //获取详情数据
		        this.fetchData()
		    });
        },
        methods: {
            fetchData() {

                this.columnId = (this.$route.query.columnId)
                // this.isLogin = Auth.checkLogin();
                this.getDetail();               
                this.getRelateColumns();
                this.$refs.catalogBox.getCatalog(this.columnId);
                //回到顶部
                Utils.backTop()
            },
            /**
             * [getNovelDetail 获取小说详情]
             * @return {[type]} [description]
             */
            getDetail() {
               
        	    let options = {
        	        columnId:this.columnId,
        	    	contentType:this.contentType
        	    };
        	  
        	    options.callback = (results)=>{
                    if(results.resultCode == 0) {
                        let body = results.body;
                        if(body) {
                            this.column = body;
                            this.inBookShelf  = body.inBookShelf; 
                        }                        
                    } else {
                        Tips.showTips({
                            type: 'error',
                            msg: '获取详情失败,请稍候重试'
                        })
                    }          
        	    };

       	        AudioServices.getColumnDetail(options); 
            },            
            /**
             * [getRelateColumns 获取关联推荐小说]
             * @return {[type]} [description]
             */
            getRelateColumns () {
                let options = {
                    columnId: this.columnId,
                    contentType: this.contentType,
                    size: 3
                };
            
                options.callback = (results)=>{ 
                    if(results.resultCode == 0) { 
                        if(results.body && results.body.list) {
                            this.relatNovels = results.body.list;
                        }
                    } else {
                        Tips.showTips({
                            type: 'error',
                            msg: '获取关联推荐失败，请稍候重试'
                        })
                    }           
                };
                
                AudioServices.getRelateColumns(options); 
            },
            goUcenter () {
                this.$router.push({name: 'myaudio'})
            },
            // addBooks () {
            //     if (this.isLogin) { //已登录，直接添加入书架
            //         let options = {
            //             columnId: this.column.columnId,
            //             opreateType: 0
            //         }
            //         options.callback = (results) => {
            //             if(results.resultCode ==0 ) {
            //                 if(results.body && results.body.result == 0) {
            //                     //加入书架成功
            //                     this.inBookShelf = 1; 
            //                     Tips.showTips({
            //                         type: 'success',
            //                         msg: '加入听书成功',
            //                         showTime: 3000
            //                     });
            //                 } else {
            //                     Tips.showTips({
            //                         type: 'error',
            //                         msg: '加入失败，请稍后再试'
            //                     });
            //                 }
            //             } else {
            //                 //tip error
            //                 Tips.showTips({
            //                     type: 'error',
            //                     msg: '操作失败，请稍后再试'
            //                 });
            //             }
            //         };

            //         AudioServices.updateBooks(options)
            //     } else {
            //         Auth.goLogin()
            //     }       
            // } 
        },
        computed: {           
            filterPrice () {
                
                let price = '免费';
                
                if (this.column.supportFirstSub ==1) {
                    price = this.column.subPrice + '元'
                } else if(this.column.supportSecSub == 1) {
                    price = this.column.secPrice + '元'
                } 

                return price;                
            },
            filterUnit () { //价格单位
                if (this.column.supportFirstSub ==1) {
                    return '/本';
                } else if(this.column.supportSecSub == 1) {
                    return '/章'
                } 
                return '';
            },            
            filterName () {   //处理栏目
                
                let columnName = this.column.columnName;
                let winWidth = document.body.scrollWidth;
                let maxSize = this.maxLength[winWidth] || 12;
                if (!columnName) return;
                if (Utils.getStringlen(columnName)/2 > maxSize) {
                    columnName = columnName.slice(0, maxSize-1);
                    columnName += '...';
                }
                return columnName;
            },
            filterAuther () { //处理作者

                let author = this.column.author;
                let winWidth = document.body.scrollWidth;
                let maxSize = this.stringMaxLength[winWidth] || 10;
               
                if (!author) return; 
                if (Utils.getStringlen(author) > maxSize) {
                    author = author.slice(0, maxSize);
                    author += '...';
                }
                return author;
            },
            filterReaderName () {  //处理主播

                let readerName = this.column.readerName;
                let winWidth = document.body.scrollWidth;
                let maxSize = this.stringMaxLength[winWidth] || 8;
               
                if (!readerName) return; 
                if (Utils.getStringlen(readerName) > maxSize) {
                    readerName = readerName.slice(0, maxSize);
                    readerName += '...';
                }
                return readerName;
            },
            filterPageName () { //处理页面名称

                let columnName = this.column.columnName;
               
                if (!columnName) return; 
                if (Utils.getStringlen(columnName)/2 > 8) {
                    columnName = columnName.slice(0, 8);
                    columnName += '...';
                }
                return columnName;
            },
            filterCount () { //处理阅读人数
                return Utils.showData(this.column.subscribeCount);
            },
            isBookShelf () {
                return this.inBookShelf==1; 
            }
        },
        beforeRouteLeave(to, from, next) {
            // console.log(from.name +' --> '+to.name)
            // if (to.name == 'audiocategory') {
            //     to.meta.keepAlive = true;
            // } 
            next();
        }
    }
</script>
<style scoped>
  .detail {
    background:#f4f5f7;
  }
</style>