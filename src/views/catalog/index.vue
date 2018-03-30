<template>
<div>
    <top-header :pageName="pageName" ></top-header>
    <section class="novelRecom_Warp cloudPLR15">
        <!-- 小说目录  -->
        <dl class="catalogListBox  pt_10">
            <dd>
                <ul class="catalogList_other">
                    <Catalog v-for="(item, index) in items" :item="item" :key="index" :curentOid="orderId"></catalog>
                </ul>
            </dd>
        </dl>
    </section>
</div>
</template>
<script type="text/javascript">

    import TopHeader      from  'COMPONENTS/TopHeader'
    import Catalog        from  'COMPONENTS/Catalog'
    import AudioServices  from  'SERVICES/audioServices'
    import Tips           from  'UTILS/tips'
    import Utils          from  'UTILS/utils'
    import EventUtil      from  'UTILS/eventUtil'

    export default {
        name: 'catalog',
        data () {
            return {
                pageName: '目录',
                columnId: 0,
                orderId: 0,
                pageCount: 20,
                currentPageNum: 1,
                upPageNum: 1,
                totalPageNum: 0,
                items:[],
                isRequested: false,            
                aScrollTop : 0,
                direction: 'down'
            }
        },
        components:{
            TopHeader,
            Catalog
        },
        mounted () {
            this.$nextTick(function(){

                let query = this.$route.query;
                this.columnId = query.columnId;
                this.orderId = query.orderId;
                
                if (query.pageNum) {
                    this.currentPageNum = query.pageNum;
                    this.upPageNum = query.pageNum;
                }

                this.getCatalog(this.currentPageNum);
                this.addScrollEvent();
            });
        },
        watch: {
            currentPageNum (newVal, oldVal) { 

                if (oldVal != 1) {
                    this.getCatalog(newVal);
                }           
            },
            upPageNum (newVal, oldVal) {
                if (oldVal != 1) {
                    this.getCatalog(newVal)
                }
            }
        },
        methods: {
           
            /**
             * [getNovelDetail 获取目录信息]
             * @return {[type]} [description]
             */
            getCatalog (pageNum) {
               
                let options = {
                    columnId: this.columnId,
                    paging: {
                      currentPageNum: pageNum,
                      perPageCount: this.pageCount
                    }
                };
                this.isRequested = true;
                options.callback = (results)=>{
                    if(results.resultCode == 0) {
                        let result = results.body;
                        if(result && result.items) {   
                            
                            let {currentPageNum, totalPageNum} = result.paging;
                            let items = result.items;

                            if(this.direction == 'down') {
                                this.items = this.items.concat(items);
                            } else if(this.direction == 'up'){
                                this.items = items.concat(this.items);
                                
                                //向下滚动100px;
                                let height = this.upPageNum*500 
                                Utils.backTop(height);
                            }
                            
                            this.totalPageNum = totalPageNum;
                        }                   
                    } else {
                        Tips.showTips({
                            type: 'error',
                            msg: '获取目录失败'
                        })
                    }    
                    this.isRequested = false;      
                };
                
                AudioServices.getCatalog(options); 
            },
            addScrollEvent () {
                this.aScrollTop =  document.body.scrollTop ;
                EventUtil.addEvent(window, 'scroll', () => {
                    // 当前滚动条位置    
                    let wScrollY = window.scrollY; 
                    // 设备窗口的高度      
                    let wInnerH  = window.innerHeight; 
                    //可视+滚动溢出
                    let bScrollH = document.body.scrollHeight; 

                    //根据滚动距离判断滚动方向
                    let bScrollTop = document.body.scrollTop ;
                    let delta = this.aScrollTop - bScrollTop;
                    
                    if (wScrollY > 0) { //往下滚动
                        this.direction = 'down';
                        if (wScrollY + wInnerH >= bScrollH ) {  
                            if(!this.isRequested && this.currentPageNum < this.totalPageNum) {
                                this.currentPageNum ++;
                            }
                        }
                    } else if (wScrollY ==0){  //往上滚动
                        this.direction = 'up';
                        if(!this.isRequested && this.upPageNum > 1) {
                                this.upPageNum --;
                        }
                    }
                });                
            },
            destroyed () {
                EventUtil.removeEvent(window, 'scroll');
            }
        }
    }
</script>