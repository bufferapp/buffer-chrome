;(function() {
    
    var config = {};
	config.buttons = [
	    {
	        text: "buffer",
    	    container: 'div.entry ul.flat-list',
	        className: 'buffer-reddit-button',
	        selector: '.buffer-reddit-button',
	        data: function (elem) {
	            var article = $(elem).closest('.entry').find('a.title');
	            var title = $(article).text().trim();
	            var link = $(article).attr('href').trim();
	            
	            var image = $(elem).closest('.entry').siblings('.thumbnail').attr('href');
	            
	            return {
	                text: title,
	                url: link,
	                image: image
              };
	        }
      }
	];
	
	var createButton = function (btnConfig) {

	    var a = document.createElement('a');
	    a.setAttribute('class', btnConfig.className);
	    a.setAttribute('href', '#');
	    $(a).text(btnConfig.text);
	    
	    var li = document.createElement('li');
	    li.appendChild(a);

	    return li;

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