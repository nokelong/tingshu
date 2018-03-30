var Alert = {}

Alert.install = function (Vue, options) {
    
    let isShow = false;
    let currentVM = null;
    
    Vue.prototype.$Alert = ({msg="", type, isShow=false} = options) => {
        
        let iPop = type =="error"? 'i-popWarn': 'i-popRight';       
        msg = msg ? msg: type == 'success'?'操作成功': type == 'error'?'操作失败</br>请稍后再试': '未知错误';
        if (!currentVM) {
            let AlertComponent = Vue.extend({ //创建Vue组件
                data: () => {
                    return {
                        show: isShow,
                        pop: iPop,
                        msg: msg
                    }                       
                },
                template:'<div class="PopSquare blackTip layout_av" style="margin-left:-57px;" v-show="show"><i class="icon i-popRight" :class=pop> </i></br>{{msg}}</div>'
            })
            currentVM = new AlertComponent();        
            let tmpl = currentVM.$mount().$el; //获取组件挂载的元素        
            document.body.appendChild(tmpl);  
        } else {
            currentVM.pop = iPop;
            currentVM.show = isShow;
            currentVM.msg = msg
        }
        //调用遮罩层
        Vue.prototype.$LayerBlack({isShow})
    }

    Vue.prototype.$Alert['show'] = ({msg="", type} = options) => {        
        isShow = true;       
        return Vue.prototype.$Alert({msg, type, isShow})
    }
    Vue.prototype.$Alert['hide'] = () => {        
        return Vue.prototype.$Alert({isShow: false})
    }
}
export default Alert;