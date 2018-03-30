<template>
	<li class="b-flex" @touchstart="backGround=!backGround" @touchend="backGround=!backGround">
		<div href="javascript:;" @click="goDetail(novel.columnId)">
			<div class="listImg p_relative">
				<img :src="novel.columnImageUrl" :onerror="defaultImg">
				<div class="Corner hide">
					<i class="icon "></i>
				</div>
				<div class="layer_BlackFloat" v-if="backGround"></div>
			</div>
			<h3 class="Firtitle">{{filterName(novel.columnName)}}
            </h3>
            <slot name="price"></slot>
            <p class="Subtitle"><i class="iconfont wf-anchor lightBlue fz_14"></i>{{filterName(novel.readerName)}}</p>
		</div>
	</li>   
</template>
<script>
    import defaultImage  from 'IMAGES/DefaultListenImg175.png'
    import Utils         from  'UTILS/utils'
    
    export default {
        name: 'Novel',
        props: {
            novel: {
                required:true
            }
        },
        data() {
            return {
                defaultImg:'this.src="' +defaultImage + '"',
                backGround: false,
                maxLength: {
                    '320': 5,
                    '375': 5,
                    '414': 6,
                    '768': 15          
                },
                     
            }
        },
        methods:{
            goDetail (cid) {         
                this.$router.push({ name: 'audiodetail', query: { columnId: cid }})
            },
            filterName (columnName) {

                let winWidth = document.body.scrollWidth;
                let maxSize = this.maxLength[winWidth] || 5;
                let name = columnName;

                if (Utils.getStringlen(columnName)/2 > maxSize) {
                    name = columnName.slice(0, maxSize-1)
                    name += '...';
                }
                return name;           
            }
            
        }
    }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
