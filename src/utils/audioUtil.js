/**
 * AudioUtil 音频播放工具类
 */
class AudioUtil {
    /**
     * [convertDurationTime 将持续毫秒数转换成hh:mm:ss]
     * @param  {[type]} msec      [毫秒数]
     * @param  {[type]} useString [boolean 是否显示字符串]
     * @return {[type]}           [description]
     */
    convertDurationTime(msec, useString=true) {
        var nSec = Math.floor(msec / 1000),
        hh = Math.floor(nSec / 3600),
        min = Math.floor(nSec / 60) - Math.floor(hh * 60),
        sec = Math.floor(nSec - (hh * 3600) - (min * 60));

        return (useString ? ((hh ? hh + ':' : '') + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) : { min: min, sec: sec });
    }

    getOffX(o) {
      
        var curleft = 0;

        if (o.offsetParent) {
          while (o.offsetParent) {
            curleft += o.offsetLeft;
            o = o.offsetParent;
          }
        } else if (o.x) {
            curleft += o.x;
        }

        return curleft;
    }

    getClientX(e) {
        // normalize between desktop (mouse) and touch (mobile/tablet/?) events.
        // note pageX for touch, which normalizes zoom/scroll/pan vs. clientX.
        return (e && (e.clientX || (e.touches && e.touches[0] && e.touches[0].pageX)));
    }
}

export default new AudioUtil()