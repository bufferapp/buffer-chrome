;(function() {
    
    var buildElement = function buildElement (parentConfig) {
        
        var temp = document.createElement(parentConfig[0]);
        if( parentConfig[1] ) temp.setAttribute('class', parentConfig[1]);
        if( parentConfig[2] ) temp.setAttribute('style', parentConfig[2]);

        if ( parentConfig.length > 3 ) {
            var i = 3, l = parentConfig.length;
            for(; i < l; i++) {
                temp.appendChild(buildElement(parentConfig[i]));
            }
        }
        
        return temp;
        
    };
    
    var config = {};
    config.time = {
        reload: 800
    };
    config.endpoint = {
        http: "http://static.bufferapp.com/js/button.js",
        https: "https://d389zggrogs7qo.cloudfront.net/js/button.js"
    };
	config.buttons = [
	    {
	        name: "top-control",
	        text: "Buffer",
    	    container: 'div#viewer-top-controls',
    	    after: '#stream-prefs-menu',
    	    className: 'buffer-reader-button',
    	    selector: '.buffer-reader-button',
	        elements:
                    ['div', 'goog-inline-block jfk-button jfk-button-standard viewer-buttons goog-flat-menu-button', 'float: left; padding: 0 8px; min-width: 0; background: -webkit-linear-gradient(top, #f5f5f5, #f1f1f1); background: -moz-linear-gradient(top, #f5f5f5, #f1f1f1); border-color: 1px solid #c6c6c6;',
                        ['a', 'buffer-reader-button', '']
                    ],
            default: 'text-decoration: none; color: #444;',
	        style:   'float: left; padding: 0 8px; min-width: 0; background: -webkit-linear-gradient(top, #f5f5f5, #f1f1f1); background: -moz-linear-gradient(top, #f5f5f5, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        hover:   'background: -webkit-linear-gradient(top, #f8f8f8, #f1f1f1); background: -moz-linear-gradient(top, #f8f8f8, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        active:  'background: -webkit-linear-gradient(top, #f8f8f8, #f1f1f1); background: -moz-linear-gradient(top, #f8f8f8, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        create: function (btnConfig) {
	            
	            var temp = buildElement(btnConfig.elements);
	            
	            var a = $(temp).find(btnConfig.selector)[0];
        	    a.setAttribute('style', btnConfig.default);
        	    a.setAttribute('href', '#');
        	    $(a).text(btnConfig.text);

        	    $(a).hover(function () {
                    $(this).parent().attr('style', btnConfig.style + btnConfig.hover);
                }, function() {
                    $(this).parent().attr('style', btnConfig.style);
                });

                $(a).mousedown(function () {
                    $(this).parent().attr('style', btnConfig.style + btnConfig.active);
                });

                $(a).mouseup(function () {
                    $(this).parent().attr('style', btnConfig.style + btnConfig.hover);
                });

        	    return temp;
	            
	        },
	        data: function (elem) {
	            
	            var target = $("#current-entry .entry-container a.entry-title-link");
	            
	            if( target.length == 0 ) target = $("#entries .entry").first().find(".entry-container a.entry-title-link");
	            
	            return {
	                url: target.attr('href'),
	                text: target.text()
	            }
	        }
        },
        {
	        name: "share",
	        text: "Buffer",
    	    container: 'div.entry-actions',
    	    after: '.item-plusone + wbr',
    	    className: 'buffer-share-button',
    	    selector: '.buffer-share-button',
	        elements:
                    ['a', 'buffer-add-button', 'height: 18px; width: 75px; margin-right: 16px; display: inline-block; text-indent: 0px; margin: 0px; padding: 0px; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; border:none; line-height: normal; font-size: 1px; vertical-align: baseline; background-position: initial initial; background-repeat: initial initial;',
	                    ['div', '', 'position: relative; top: -2px; height: 16px; font-size: 13px; padding-left:20px; margin-right: 16px; background-image: url(http://static.bufferapp.com/images/logo_icon_small.png); background-repeat: no-repeat!important;',
                            ['span', '', 'height: 22px; width: 50px; position: relative; top: 2px;']
	                    ]
                    ],
            default: '',
	        style:   '',
	        hover:   '',
	        active:  '',
	        disallowClick: true,
	        create: function (btnConfig) {
	            
	            var temp = buildElement(btnConfig.elements);
	        
        	    temp.setAttribute('data-count', 'horizontal');
        	    temp.setAttribute('href', '#');
        	    $(temp).find('span').text(btnConfig.text);

        	    return temp;
	            
	        },
	        activator: function (elem, btnConfig) {
	            
                $(elem).after('<wbr></wbr>');
    
	        },
	        data: function (elem) {
                var target = $(elem).closest(".entry").find(".entry-container a.entry-title-link");
                return {
                    text: target.text(),
                    url: target.attr('href')
                };
            }
        },
        {
	        name: "icon",
	        text: "",
    	    container: 'span.entry-icons-placeholder',
    	    after: '.entry-icons',
    	    className: 'buffer-small-button',
    	    selector: '.buffer-small-button',
	        elements: ['a', 'buffer-small-button', 'height: 17px; width: 17px; display: inline-block; position: relative; top: 2px; margin-left: 5px; background-repeat: none;'],
            default: '',
	        style:   '',
	        hover:   '',
	        active:  '',
	        create: function (btnConfig) {
	            
	            var temp = buildElement(btnConfig.elements);
	            
        	    temp.setAttribute('href', '#');
        	    $(temp).text(btnConfig.text);
        	    $(temp).css({"background-image": "url(" + xt.data.get("data/img/google-reader-logo-small-white.png") + ")"})

        	    return temp;
	            
	        },
	        activator: function (elem, btnConfig) {
	            
        	    $(elem).hover(function () {
        	        $(this).css({"background-image": "url(" + xt.data.get("data/img/google-reader-logo-small-grey.png") + ")"});
        	    }, function () {
        	        $(this).css({"background-image": "url(" + xt.data.get("data/img/google-reader-logo-small-white.png") + ")"});
        	    });
    
	        },
	        data: function (elem) {
	            
	            var target = $(elem).closest(".entry").find(".entry-container a.entry-title-link");
        	    return {
        	        text: target.text(),
        	        url: target.attr('href')
        	    };
        	    
	        }
        }
	];

    ;(function bufferEmbed() {

    	var insertButtons = function () {

    	    var i, l=config.buttons.length;
    	    for ( i=0 ; i < l; i++ ) {

    	        var btnConfig = config.buttons[i];
                
                $(btnConfig.container).each(function () {
                    
                    var container = $(this);
                    
                    if ( $(container).hasClass('buffer-inserted') ) return;

        	        $(container).addClass('buffer-inserted');

        	        var btn = btnConfig.create(btnConfig);

                    if ( btnConfig.after ) $(container).find(btnConfig.after).after(btn);
                    else $(container).append(btn);

    	            if ( !! btnConfig.activator ) btnConfig.activator(btn, btnConfig);
    	            
    	            if ( !! btnConfig.lastly ) btnConfig.lastly(btn, btnConfig);
    	            
    	            var getData = btnConfig.data;
    	            var clearData = btnConfig.clear;
    	            
    	            var clearcb = function () {};
                    
                    // disallow must be true to disable click handlers
                    if( btnConfig.disallowClear !== true ) {
                    
        	            $(btn).click(function (e) {
            	            clearcb = function () { // allow clear to be called for this button
                	            if ( !! clearData ) clearData(btn);
                	        };
            	            xt.port.emit("buffer_click", getData(btn));
            	            e.preventDefault();
            	        });
        	        
            	        xt.port.on("buffer_embed_clear", function () {
                            clearcb();
            	            clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
            	        });
            	        
    	            }
                    
                })

    	    }

    	};

    	insertButtons();
    	
    	setTimeout(bufferEmbed, config.time.reload);

    }());
    
}());