class Storage {

	constructor (win, obj) {
        this.storage = win[obj];
	}
    get (key, clearCache) {
        if (this.storage) {
            var r = this.storage[key];
            var hasValue = typeof r == "string";
            if (hasValue && clearCache)
                this.remove(key);
            return hasValue ? r : null;
        }
    }
    set (key, value) {      
        if (this.storage) {
	        try  {
	            this.storage[key] = value;
	            return true;
	        } catch (e) {}
        }
        return false;
    }
    remove (key) {
        if (this.storage) {
            this.storage.removeItem(key);
        }
    }
    clear () {
        if (this.storage) {
            this.storage.clear();
        }
    }
}

export default Storage;