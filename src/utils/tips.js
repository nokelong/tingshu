import Alert  from 'PLUGINS/Alert'

class Tips {
    /**
     * [showTips 提示]
     * @param  {[type]} options [参数对象]
     * @param  {[type]} options.type [提示类型 error success 默认 success]    
     * @param  {[type]} options.msg [提示语]
     * @param  {[type]} options.showTime [提示显示时间  默认1秒]
    */
    showTips (options) {     
        this.tip(options,options.type)
    }

    tip (options, type) {
        if (!options)
            return;
        if (typeof options === "string") {
            options = { msg: options };
        } else {
            if (!options.msg) return;
        }
      
        Alert.show({
            text: options.msg,
            type: type || 'success'
        })
        setTimeout(function () {
            Alert.hide()         
        }, options.showTime || 1000);
    }   
}

export default new Tips();