//遮罩层插件
var LayerBlack = {}
LayerBlack.install = function(Vue, options) {
	var currentVm = null;
    Vue.prototype.$LayerBlack = ({isShow=false}=options) => {        
        if (!currentVm) {
        	let BlackComponent = Vue.extend({
        		data: () => {
                    return {
                    	show: isShow
                    }
        		},
        		template: '<div class="layer_black" v-show="show"></div>'
        	})
            currentVm = new BlackComponent();
            let el = currentVm.$mount().$el;
            document.body.appendChild(el)
        } else {
        	currentVm.show = isShow
        }
    }   
}

export default LayerBlack