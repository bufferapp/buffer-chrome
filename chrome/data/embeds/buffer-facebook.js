;(function() {
    
    var config = {};
    config.base = "https://facebook.com";
    config.time = {
        reload: 800
    };
	config.buttons = [
	    {
	        name: "status",
	        text: "Buffer",
    	    container: 'ul.uiComposerBarRightArea',
    	    className: 'buffer-facebook-button',
    	    selector: '.buffer-facebook-button',
	        elements:
	                ['li', 'pls uiListItem uiListHorizontalItemBorder uiListHorizontalItem',
                        ['label', '',
                            ['a', 'buffer-facebook-button']
                        ]
                    ],
            default: 'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
	        style:   'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
	        hover:   'background: hsl(116, 39%, 42%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); text-decoration: none;',
	        active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
	        create: function (btnConfig) {
	            
	            var buildElement = function buildElement (parentConfig) {
	                
	                var temp = document.createElement(parentConfig[0]);
	                temp.setAttribute('class', parentConfig[1]);
	                
	                if ( parentConfig.length > 2 ) temp.appendChild(buildElement(parentConfig[2]));
	                
	                return temp;
	                
	            };
	            
	            var temp = buildElement(btnConfig.elements);
	            
	            var a = $(temp).find(btnConfig.selector)[0];
        	    a.setAttribute('style', btnConfig.default);
        	    a.setAttribute('href', '#');
        	    a.innerText = btnConfig.text;

        	    $(a).hover(function () {
        	        if( $(this).hasClass("disabled") ) {
        	            $(this).attr('style', btnConfig.default);
        	            return;
    	            }
                    $(this).attr('style', btnConfig.style + btnConfig.hover);
                }, function() {
                    if( $(this).hasClass("disabled") ) return;
                    $(this).attr('style', btnConfig.style);
                });

                $(a).mousedown(function () {
                    if( $(this).hasClass("disabled") ) return;
                    $(this).attr('style', btnConfig.style + btnConfig.active);
                });

                $(a).mouseup(function () {
                    if( $(this).hasClass("disabled") ) return;
                    $(this).attr('style', btnConfig.style + btnConfig.hover);
                });

        	    return temp;
	            
	        },
	        data: function (elem) {
	            return $(elem).closest('.uiMetaComposerMessageBox').find('textarea.textInput').val();
	        },
	        clear: function (elem) {
				$(elem).closest('.uiMetaComposerMessageBox').find('textarea.textInput').val('');
	        }
        },
        {
	        name: "share",
	        text: "Buffer",
    	    container: 'span.UIActionLinks.UIActionLinks_bottom',
    	    className: 'buffer-facebook-button',
    	    selector: '.buffer-facebook-button',
	        elements:
	                ['a', ''],
            default: '',
	        style:   '',
	        hover:   '',
	        active:  '',
	        create: function (btnConfig) {
	            
	            var buildElement = function buildElement (parentConfig) {
	                
	                var temp = document.createElement(parentConfig[0]);
	                temp.setAttribute('class', parentConfig[1]);
	                
	                if ( parentConfig.length > 2 ) temp.appendChild(buildElement(parentConfig[2]));
	                
	                return temp;
	                
	            };
	            
	            var temp = buildElement(btnConfig.elements);
	            
	            var a = temp;
	            if ( $(temp).children().length > 0 ) a = $(temp).find(btnConfig.selector)[0];
        	    a.setAttribute('style', btnConfig.default);
        	    a.setAttribute('href', '#');
        	    a.innerText = btnConfig.text;

        	    return temp;
	            
	        },
	        lastly: function (elem) {
	            $(elem).after(" · ")
	        },
	        data: function (elem) {
	            return '“' + $(elem).closest('.mainWrapper').find('span.messageBody').text()
	                       + '” – ' + $(elem).closest('.mainWrapper').find('.uiStreamHeadline > .actorName').text()
	                       + ' on #fb: ' + config.base + $(elem).closest('div.uiStreamFooter').find('span.uiStreamSource > a').attr('href');
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

        	        $(btn).click(function (e) {
        	            clearcb = function () { // allow clear to be called for this button
            	            if ( !! clearData ) clearData(btn);
            	        };
        	            self.port.emit("buffer_click", getData(btn));
        	            e.preventDefault();
        	        });
        	        
        	        self.port.on("buffer_embed_clear", function () {
                        clearcb();
        	            clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
        	        });
                    
                })

    	    }

    	};

    	insertButtons();
    	
    	setTimeout(bufferEmbed, config.time.reload);

    }());
    
}());