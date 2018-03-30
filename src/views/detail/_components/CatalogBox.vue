<template>
	<section class="novelCatalogBox">
		<div class="cloudPLR15 mt_15">
			<h3>内容简介</h3>
			<p class="">{{filterDes}}</p>
			<h4 class="ta_c h_30" v-if="column.longDescription.length > max_length" @click=showMoreDes>
				<i class="iconfont wf-arrowB c_lightgray"></i>
			</h4>
		</div>
		<div class="novelCatalog bt_d9 ">
			<dl class="catalogListBox cloudPLR15">
				<dt class="titleBox">目录<span class="c_darkGray">（共{{catalog.paging.totalCount}}章）</span></dt>
				<dd>
					<div class="catalogList_first bm_d9 bt_d9">
						<a href="javascript:;" class="d-box" @click="goReader($event)">
							<i class="icon i-newTip mr_5 mt_3"></i>
							<span class="fz_14 b-flex lightBlue text-overflow">{{filterTitle}}</span>
                            <span class="c_lightgray fz_12">{{filterMdyDate}}</span>
                            <div class="ml_10 mr_10" v-if="filterLock">
                                <span class="c_red chapterNumRed" style="line-height:18px;" v-if="newChapter.price !=0">{{filterNewChapterPrice}}</span>
                            </div>
                            <i class="iconfont wf-lock mr_5" v-if="filterLock"></i>
						</a>
					</div>
					<ul class="catalogList_other">
					<catalog v-for="(item,index) in filterCataLog" :item="item" :key="item.serialId" :curentId="1"></catalog>
					</ul>
				</dd>
				<!-- 查看更多 -->
    			<div class="d-box viewMoreBox mt_15" v-if="catalog.paging.totalPageNum >1">
		    		<a class="ta_av bg_white" href="javascript:;" @click="goCatalog">
		    			查看更多
		    			<i class="iconfont wf-arrowR fz_12 ml_3"></i>
		    		</a>
			    </div>
			</dl>
		</div>
	</section>
</template>
<script type="text/javascript">
    
    import Catalog       from 'COMPONENTS/Catalog'
    import AudioServices from 'SERVICES/audioServices'
    import Tips          from 'UTILS/tips'     

    export default {
        name: 'CatalogBox',
        components: {Catalog},
        data() {
            return {
            	max_length: 116,
            	columnId: this.column.columnId,
                newChapter: null,
            	catalog: {
	               items: [],
	               paging: {
                       totalCount: 0
	               }
	            },
                isLogin: false
            }
        },
        props: {
            column: {
            	type: Object,
            	required: true
            }
        },
        mounted () {
		    this.$nextTick(function(){
		        //获取详情数据
		        // this.getCatalog()
                // this.isLogin = Auth.checkLogin();   
		    });
        },        
        methods: {
            /**
             * [getCatalog 获取目录]
             * @return {[type]} [description]
             */
            getCatalog(cid) {
                
                this.columnId = cid;
                let options = {
                    columnId: this.columnId,                    
                    paging: {
                      currentPageNum:1,
                      perPageCount:10
                    }
                };
            
                options.callback = (results)=>{ 
                    if(results.resultCode == 0) {
                        if(results.body ) {
                            //结构result中的对象             
                            let {items,newAudioChapter,paging} = results.body;
                            this.catalog.items = items;
                            // if (newAudioChapter) {
                            
                            this.newChapter = newAudioChapter;
                            // }
                            if (paging) {
                                this.catalog.paging = paging;  
                            }
                        }
                    } else {
                        Tips.showTips({
                            type: 'error',
                            msg: '获取目录失败'
                        })
                    }           
                };
                AudioServices.getCatalog(options); 
            },
            /**
             * [showMoreDes 更多简介]
             * @return {[type]} [description]
             */
            showMoreDes() {
                this.max_length = this.column.longDescription.length;
            },
            /**
             * [goCatalog 更多目录]
             * @return {[type]} [description]
             */
            goCatalog() {                       
                this.$router.push({name:'audiocatalog',query:{columnId:this.columnId}})
            },            
            goReader(e) {
                
                let newChapter = this.newChapter;
                if (!newChapter) {
                    e.stopPropagation();
                    return false;
                } else {
                    
                    let options = {
                        data: newChapter
                        // columnId: newChapter.columnId,
                        // orderId: newChapter.orderId
                    }
                    //验证是否登录，是否收费
                    // if (newChapter.isLocked == 0) { 
                    //     if (this.isLogin) {  //已登录
                    //         if (newChapter.price == 0) { //
                    //             Tips.showTips({
                    //                 type: 'error',
                    //                 msg: '本栏目仅支持全本购买',
                    //                 showTime: 3000
                    //             })
                    //         } else {
                    //             Purchase.subscribeAudioConfirm(options);
                    //         }
                    //     } else {
                    //         Auth.goLogin(true);
                    //     } 
                    // } else {
                        this.$router.push({
                            name: 'player',
                            query: {
                                columnId: newChapter.columnId,
                                oid: newChapter.orderId,
                                pageNum: newChapter.currentPageNum
                            }
                        });
                    // }
                }
            }
        },
        computed: {
            filterTitle () {
                
                let chapter = this.newChapter;
                
                if (!chapter) {
                    return '无';
                } else {
                    return '第' +chapter.orderId + '章 ' +chapter.title;
                }
               
            },
            filterMdyDate () {

                let chapter = this.newChapter;
                
                if(!chapter || !chapter.modifyDate) {
                    return '无';
                } else {
                    let mdyDate = chapter.modifyDate || ''
                    let today = new Date()
                      
                    if(today.toDateString() === new Date(mdyDate.replace(/-/g, '/')).toDateString()) {  
                        //当天，显示时间
                        return mdyDate.split(' ')[1] ; 
                    }
                    return mdyDate.split(' ')[0];
                }	         
            },
            filterCataLog () {
                return this.catalog.items.slice(0,10)
            },
            filterDes () {
                
	            let longDescription = this.column.longDescription;
	            let des = longDescription.slice(0,this.max_length)
	            
	            if(this.max_length < longDescription.length) des += '...'
	            return des;
            },
            filterLock () {
                let chapter = this.newChapter;
                if (!chapter) {
                    return false ;
                } else {
                    return chapter.isLocked==0
                }
            },
            filterNewChapterPrice () {
                let chapter = this.newChapter;
                if (!chapter) {
                    return false ;
                } else if (chapter.price){
                    return chapter.price + '元/章'
                }
            }
        }
    }
</script>