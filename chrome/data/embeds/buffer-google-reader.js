;(function() {
    
    var config = {};
    config.time = {
        reload: 800
    };
	config.buttons = [
	    {
	        name: "top-control",
	        text: "Buffer",
    	    container: 'div#viewer-top-controls',
    	    after: '#stream-prefs-menu',
    	    className: 'buffer-reader-button',
    	    selector: '.buffer-reader-button',
	        elements: ['div', 'goog-inline-block jfk-button jfk-button-standard viewer-buttons goog-flat-menu-button', 'float: left; padding: 0 8px; min-width: 0; background: -webkit-linear-gradient(top, #f5f5f5, #f1f1f1); border-color: 1px solid #c6c6c6;',
                          ['a', 'buffer-reader-button', '']
                      ],
            default: 'text-decoration: none; color: #444;',
	        style:   'float: left; padding: 0 8px; min-width: 0; background: -webkit-linear-gradient(top, #f5f5f5, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        hover:   'background: -webkit-linear-gradient(top, #f8f8f8, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        active:  'background: -webkit-linear-gradient(top, #f8f8f8, #f1f1f1); border-color: 1px solid #c6c6c6;',
	        create: function (btnConfig) {
	            
	            var buildElement = function buildElement (parentConfig) {
	                
	                var temp = document.createElement(parentConfig[0]);
	                temp.setAttribute('class', parentConfig[1]);
	                temp.setAttribute('style', parentConfig[2]);
            
	                if ( parentConfig.length > 3 ) {
	                    var i = 3, l = parentConfig.length;
	                    for(; i < l; i++) {
	                        temp.appendChild(buildElement(parentConfig[i]));
                        }
                    }
	                
	                return temp;
	                
	            };
	            
	            var temp = buildElement(btnConfig.elements);
	            
	            var a = $(temp).find(btnConfig.selector)[0];
        	    a.setAttribute('style', btnConfig.default);
        	    a.setAttribute('href', '#');
        	    a.innerText = btnConfig.text;

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
        	        
        	        self.port.on("buffer_twitter_clear", function () {
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