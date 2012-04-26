;(function() {
    
    var config = {};
    config.base = "http://news.ycombinator.org/",
	config.buttons = [
	    {
	        text: "add to buffer",
    	    container: 'td.subtext',
	        className: 'buffer-hn-button',
	        selector: '.buffer-hn-button',
	        data: function (elem) {
	            var article = $(elem).parents('tr').prev('tr').find('.title').children('a');
	            var title = $(article).text().trim();
	            var link = $(article).attr('href').trim();
	            
	            return {
	                text: title,
	                url: link
                };
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
                
                if ( $(container).hasClass('buffer-inserted') ) return;

    	        $(container).addClass('buffer-inserted');

    	        var btn = createButton(btnConfig);

    	        $(container).append(btn);
    	        
    	        $(btn).before(' | ');
	            
	            var getData = btnConfig.data;

    	        $(btn).click(function (e) {
    	            self.port.emit("buffer_click", getData(btn));
    	            e.preventDefault();
    	        });
                
            })

	    }

	};
	
	insertButtons();

}());