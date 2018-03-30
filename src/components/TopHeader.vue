<template>	
 	<header class="headBar p_fixed bg_blue d-box">
    	<aside class="pl_15 ta_avC" style="width:70px;" >
			<a class="btnBox" href="javascript:;" v-if="!isHome" @click="goBack">
				<i class="iconfont wf-arrowL c_fff"></i> 
			</a>
		</aside>
		<section class="b-flex">
			<h2 class="headBar-title c_fff">{{filtterPageName}}</h2>
		</section>
				
		<aside class="pr_10 ta_r" style="width: 70px;">
			<slot></slot>
		</aside>
    </header>
</template>
<style>
</style>
<script> 

    import Tips         from 'UTILS/tips'
	export default {
		name:'topheader',
		props:{
			isHome: {
				type:Boolean,
				default:false
			},
			pageName: {
				type:String
			}
		},
		data() {
			return {
			    isLogin: false
			}
		},
		computed: {		
			filtterPageName: function() {
				let name = this.pageName;				
				if(name && name.length >12) {
                    name = name.slice(0,11)
				}
			    return name;
			}
		},
		methods: {			
	        goBack: function() {
	            this.$router.go(-1)
	        }
		}
	}
</script>