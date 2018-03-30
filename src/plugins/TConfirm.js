var Dialog = {};
Confirm.install = function (Vue, options) {
    Vue.prototype.$Confirm = function ({msg, text="", isShow=false} = options) {
        
        let DialogComponent = Vue.extend({
        	data () => {
                return {
                	show: isShow,
                    content: content,
                    iClass: text
                }
        	},
            template: `<article class="popWin  dialogBox dialogCenter dialogPayoff" id="dialogCenter">
                   <section class="popBox dialog_container" id="confrimCont">
			           <div class="popWarp">
			            <div class="popTitle bm_none">{{content}}</div>
			            <div class="popfooter mt_30">
			                <div class="d-box">
			                    <div href="javascript:void(0);" btnType="0" class="b-flex btn btnBlueH" :class="cla1">{{value1}}</div>
			                </div>
			                <div class="d-box mt_15">
			                    <div href="javascript:void(0);" btnType="1" class="b-flex btn btnBlueH" :class="cla2"><strong>{{value2}}</strong></div>
			                </div>
			            </div>
				        </div>
				       </section>
				    </article>`
        });

        let componentInstance = new DialogComponent();
        let el = componentInstance.$mount().$el;
        document.body.appendChild(el);
    }
    

    Vue.prototype.$Confirm['close'] = function (options) {

    }
}