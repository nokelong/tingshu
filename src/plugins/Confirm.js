//公用的弹出确认组件
import EventUtil from 'UTILS/eventUtil'

class Confirm {
    static template = ['<section class="popBox dialog_container" id="confrimCont">',
        '<div class="popWarp">',
            '<div class="popTitle bm_none">{content}</div>',
            '<div class="popfooter mt_30">',
                '<div class="d-box">',
                    '<div href="javascript:void(0);" btnType="0" class="b-flex btn btnBlueH {cla1}">{value1}</div>',
                '</div>',
                '<div class="d-box mt_15">',
                    '<div href="javascript:void(0);" btnType="1" class="b-flex btn btnBlueH {cla1}"><strong>{value2}</strong></div>',
                '</div>',
            '</div>',
        '</div>',
    '</section>'].join("")

    constructor(options={}) {
        options.fClass = options.fClass || "mb_35 mt_45";
        this.options = options;
        this.initHTML();
    }
    initHTML() {
        let tag, layer, dialogBox ;
       
        dialogBox = document.getElementsByClassName('popWin  dialogBox dialogCenter'),        
        layer = document.createElement('div');
        layer.className = 'layer_black';        
        
        if (dialogBox.length > 0) {
            tag = dialogBox[0];
        } else {
            tag = document.createElement('article');
            tag.className = 'popWin  dialogBox dialogCenter dialogPayoff';
            tag.id = 'dialogCenter';
        }
        tag.innerHTML = this.renderHTml();
        document.body.appendChild(layer);
        document.body.appendChild(tag);
        
        this.resize(); 
        this.initEvents();
    }
    initEvents() {
        
        let btns = document.getElementsByClassName('btn btnBlueH');
        for(let i = 0; i<btns.length; i++) {
            let type = btns[i].getAttribute('btnType');
            EventUtil.addEvent(btns[i], 'click', this.options.menuInfo[type].event);
            // this.options.menuInfo[type].event.call(this, null);
        }     
    }
    resize() {
        let dialogCont = document.getElementById('confrimCont');
        dialogCont.style.height = dialogCont.offsetHeight +'px';
        dialogCont.style.marginTop = (-dialogCont.offsetHeight/2 +'px');
    }
    renderHTml() {
    
        let options = this.options,           
            menuLength = options.menuInfo.length,
            html = Confirm.template.replace('{content}', options.template),
            classArr = ['hide', 'hide'],
            valueArr = ['确认', '取消'];
      
        for(let i = 0; i < menuLength; i++){
            classArr[i] = '';
            valueArr[i] = options.menuInfo[i].value
        }
           
        html = html.replace('{cla1}', classArr[0])
            .replace('{cla2}', classArr[0])
            .replace('{value1}', valueArr[0])
            .replace('{value2}', valueArr[1])

        return html;
    }  
    close () {
        let dialogs = document.getElementsByClassName('dialog_container');
        let layers = document.getElementsByClassName('layer_black');
        
        for(let i =0; i < dialogs.length; i++) {
            if (dialogs[i] != null) {
                dialogs[i].parentNode.removeChild(dialogs[i]);
            }
        }

        for(let j = 0; j < layers.length; j++) {
            if (layers[j] != null) {
                layers[j].parentNode.removeChild(layers[j]);
            }
        }
    }   
}
export default Confirm
