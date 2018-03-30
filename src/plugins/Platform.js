class Platform {
    static platforms = [
        {
            property: 'platform',
            regex: /iPhone/i,
            identity: 'iPhone'
        },
        {
            property: 'platform',
            regex: /iPod/i,
            identity: 'iPod'
        },
        {
            property: 'userAgent',
            regex: /iPad/i,
            identity: 'iPad'
        },
        {
            property: 'userAgent',
            regex: /Blackberry/i,
            identity: 'Blackberry'
        },
        {
            property: 'userAgent',
            regex: /Android/i,
            identity: 'Android'
        },
        {
            property: 'userAgent',
            regex: /Windows\sPhone/i,
            identity: 'wp'
        },
        {
            property: 'platform',
            regex: /Mac/i,
            identity: 'Mac'
        },
        {
            property: 'platform',
            regex: /Win/i,
            identity: 'Windows'
        },
        {
            property: 'platform',
            regex: /Linux/i,
            identity: 'Linux'
        }, {
            property: 'platform',
            regex: /light139/i,
            identity: 'light139'
        }
    ]
    constructor () {
        this.Desktop;
        this.Tablet;
        this.Phone;
        this.iOS;
        this.light139;
        this.Standalone;
        this.iPhone;
        this.iPod;
        this.iPad;
        this.Android;
        this.Mac;
        this.Windows;
        this.Linux;
        this.wp;
        this.init();
    }
    init(navigator) {
        var This = this;
        var platforms = Platform.platforms, ln = platforms.length, i, platform;

        navigator = navigator || window.navigator;

        for (i = 0; i < ln; i++) {
            platform = platforms[i];
            This[platform.identity] = platform.regex.test(navigator[platform.property]);
        }

        //@property Desktop True if the browser is running on a desktop machine
        This.Desktop = This.Mac || This.Windows || (This.Linux && !This.Android);

        // @property Tablet True if the browser is running on a tablet (iPad)
        This.Tablet = This.iPad;

        // @property Phone True if the browser is running on a phone.
        This.Phone = !This.Desktop && !This.Tablet;

        //@property iOS True if the browser is running on iOS
        This.iOS = This.iPhone || This.iPad || This.iPod;
        
        // @property Standalone Detects when application has been saved to homescreen.
        This.Standalone = !!window.navigator["standalone"];       
    }    
}

export default new Platform()