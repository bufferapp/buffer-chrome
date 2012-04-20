$(function() {
    
    var config = {};
    config.base = "http://news.ycombinator.org/",
	config.buttons = [
	    {
	        text: "Add to Buffer",
    	    container: 'td.subtext',
	        className: 'buffer-hn-button',
	        data: function (elem) {
	            var title = $(elem).parents('tr').prev('tr').find('.title').children('a').text().trim();
	            
	            var siblings = $(elem).siblings('a');
	            var i, l = siblings.length;
	            var link = config.base;
	            for( i=0; i < l; i++ ) {
	                var a = siblings[i];
	                if( $(a).text().indexOf('comment') !== -1 ) {
	                    link += $(a).attr('href').trim();
	                }
	            }
	            
	            return title + ' ' + link;
	        }
        }
	];
	
	var createButton = function (btnConfig) {

	    var a = document.createElement('a');
	    a.setAttribute('class', btnConfig.className);
	    a.setAttribute('href', '#');
	    a.innerText = btnConfig.text;

	    return a;

	};

	var insertButtons = function () {

	    var i, l=config.buttons.length;
	    for ( i=0 ; i < l; i++ ) {

	        var btnConfig = config.buttons[i];
            
            $(btnConfig.container).each(function () {
                
                var container = $(this);
                
                if ( $(container).hasClass('buffer-inserted') && $(container).find('buffer-hn-button') ) return;

    	        $(container).addClass('buffer-inserted');

    	        var btn = createButton(btnConfig);

    	        $(container).append(btn);
    	        
    	        $(btn).before(' | ');
	            
	            var getData = btnConfig.data;

    	        $(btn).click(function (e) {
    	            self.port.emit("buffer_click", getData(btn));
    	        });
                
            })

	    }

	};
	
	insertButtons();

});