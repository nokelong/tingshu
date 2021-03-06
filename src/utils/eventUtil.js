class EventUtil {
	addEvent (element=window, type, handler) {
	    if (element.addEventListener) {
            element.addEventListener(type, handler);
	    } else if (element.attachEvent) {
	    	element.attachEvent('on' + type, handler);
	    } else {
	    	element['on'+ type] = handler;
	    }
	}
	removeEvent (element=window, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if(element.detachEvent) {
			element.detachEvent('on' + type, handler);
		} else {
			element['on'+ type] = null;
		}
	}
}

export default new EventUtil()