<template>
	<li @touchstart="backGround=!backGround" @touchend="backGround=!backGround">
        <div class="d-box" @click="goDetail(novel.columnId)">
            <aside class="NovelShelfImg">
                <img :src="novel.columnImageUrl" :onerror="defaultImg">
                <div class="layer_BlackFloat" v-if="backGround"></div>
            </aside>
            <div class="b-flex ml_10">
                <h3 class="NovelList-title text-overflow" style="width:200px;">{{filterName}}</h3>
                <div class="fz_12 mt_20" style="width:200px;">{{filterDes}}</div>
                <h4 class="c_darkGray fz_12 mt_10">主播：{{filterReaderName}}</h4>
            </div>            
        </div>
    </li>
</template>
<script type="text/javascript">
    import defaultImage  from 'IMAGES/DefaultListenImg175.png'

    export default {
        name: 'NovelBox',
        props: {
        	novel: {
                required:true
            }
        },
        data() {
	        return {
	            defaultImg:'this.src="' +defaultImage + '"',
                backGround: false,
                lineSize: 14,
                AnchorSize: 11,
	            max_length: 31
	        }
	    },
	    computed: {
            filterDes () {

                let description = this.novel.description;
                let des = description.substring(0,this.max_length);

                if(this.max_length < description.length) {
                    des += '...'
                }
                return des;
            },

            filterName () { 

                let columnName = this.novel.columnName;    
                let name = columnName.substring(0,this.lineSize);
                
                if(this.lineSize < columnName.length) {
                    name += '...'
                }
                return name;
            },
            filterReaderName () {

                let columnName = this.novel.readerName;    
                let name = columnName.substring(0,this.AnchorSize);
                
                if(this.AnchorSize < columnName.length) {
                    name += '...'
                }
                return name;
            }
	    },
        methods: {
            goDetail (cid) {
                this.$router.push({ name: 'audiodetail', query: { columnId: cid }})
            }
        }
    }
</script>