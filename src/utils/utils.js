class Utils {
    /**
      * 格式化数据
      * @param  {[type]}   data     数据集
      * @param  {[type]}   size     分割大小
      * @param  {Function} callback 回调方法
      * @return {[type]}            [description]
    */
    rebuildData (data,size,callback) {
          
        var fData = [];
        if(typeof size == "string"){
            size = Number(size);
        }        
        if(size){
            var dlen = data.length;
            var len = Math.floor(dlen / size);
            var mlen = dlen % size;

            for(var i = 0; i < len; i++){  //先处理能完全展示的数据
                var arr = [];
                for(var j = i * size; j < i * size + size; j++){                    
                    arr.push(data[j]);
                }
                fData.push(arr);
            }
            if(mlen){  //如果处理后，多余数据，则单独展示
                var length = fData.length;
                var mArr = data.slice(dlen - mlen);
                fData.push(mArr);
                for(var k = 0; k < (size-mlen);k ++){
                    var da = data[k] || data[k-1] || {};
                    fData[length].push(da);
                }
            }            
        }else{
            fData = data;
        }
        if(callback&&typeof callback==='function'){
            callback(fData);
        } else return fData;
    }
    /**
     * [生成CGUID]
     * @return {[type]} [description]
     */
    getCGUID () {
        const padding = (n, m) =>{
            let len = (m || 2) - (1 + Math.floor(Math.log(n | 1) / Math.LN10 + 10e-16));
            return new Array(len + 1).join("0") + n;
        }
        let now = new Date();
        return '' + padding(now.getHours()) + padding(now.getMinutes()) + padding(now.getSeconds()) + padding(now.getMilliseconds(), 3) + padding(Math.ceil(Math.random() * 9999), 4);
    }

    /**
    *格式化文本，将字符串中包含{关键字}的地方替换成map中的属性值
    */
    format(str, map) {
        let tmp;
        for (let k in map) {
            let re = new RegExp('\\{' + k + '\\}', 'gm');
            tmp = String(map[k]).replace(/\$/g, "$$$$");
            str = str.replace(re, tmp);
        }
        return str;
    }
    /**
     * [htmlEncode html编码处理]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    htmlEncode(str) {
        if (typeof str != "string")
            return "";
        str = str.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/\"/g, "&quot;")
                 .replace(/\'/g, "&#39;")
                 .replace(/ /g, "&nbsp;")
                 .replace(/&amp;#([^\;]+);/ig, "&#$1;"); //将&#20117;转成相应的汉字“井”
          return str;
    }
    /**
     * [htmlDecode html解码处理]
     * @param  {[type]} text [description]
     * @return {[type]}      [description]
     */
    htmlDecode(text) {
        if (typeof text != "string")
            return "";
        let map = {
              '&amp;': '&',
              '&quot;': '"',
              '&lt;': '<',
              '&gt;': '>',
              "&nbsp;": " ",
              "&#39;": "'"
          };
        return text.replace(/(&quot;|&lt;|&gt;|&amp;|&nbsp;|&#39;)/g, function (str, item) {
            return map[item];
        });
        return text;
    }
    
    /**
     * [formatDate 格式化日期函数]
     * @param  {[type]} format [description]
     * @param  {[type]} date   [description]
     * @return {[type]}        [description]
     */
    formatDate(format, date) {
        if (!date)
            return "";
        if (typeof date == "number")
            date = new Date(date * 1000);
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds(),
            "w": "日一二三四五六".charAt(date.getDay())
        };
        format = format.replace(/y{4}/, date.getFullYear())
            .replace(/y{2}/, date.getFullYear().toString().substring(2));
        for (var k in o) {
            var reg = new RegExp(k);
            format = format.replace(reg, match);
        }
        function match(m) {
            return m.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length);
        }
        return format;
    }
    
  
     /**
     * [log 回到顶部]   
     * @return {[type]}     [description]
     */
    backTop(Height) {       
        
        document.body.scrollTop = Height || 0
        document.documentElement.scrollTop = Height || 0
    }

    /**
     * 获取webarea 0 灰度，1全网
     * 默认 1全网
     * @return {[type]} [description]
     */
    getWebArea () { 
        
        var webArea = 1;                     //现网
        var host = location.host;

        if (host.indexOf('hd') > 0) {        //灰度
            webArea = 0
        } else if (host.indexOf('ts') > 0) { //测试
            webArea = ""
        }
        return webArea;
    }
   
    //展示没有更多
    showNoMore (container=document.body){
        
        var noMore = document.createElement('div');
        noMore.id = 'noMore';
        noMore.className = 'loadMore c_darkGray';
        noMore.innerHTML = '没有更多~'
       
        if(!document.getElementById('noMore')) {
            container.appendChild(noMore);
        }
    }
    hideNoMore (container=document.body){
        let pops = document.getElementsByClassName('loadMore c_darkGray');
        for(let i=0; i<pops.length; i++){
            if(pops[i] != null) 
            pops[i].parentNode.removeChild(pops[i]);
        }
    }
    getStringlen(str){  
        var len = 0;  
        for (var i=0; i<str.length; i++) {   
            var c = str.charCodeAt(i);   
            //单字节加1   
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {   
                len++;   
            } else {   
                len+=2;   
            }   
        }   
        return len;  
    }
    //转换数据展现形式
    showData (data){
        var num = Number(data);
        if(num){
            if(num < 10000){
                return num;
            }else if(num >= 10000 && num < 100000000){  //万
                return parseInt(num/10000) + "万";
            }else if(num >= 100000000){  //亿
                return parseInt(num/100000000) + "亿";
            }
        }else{
            return data;
        }
    }
}
export default new Utils()
 




