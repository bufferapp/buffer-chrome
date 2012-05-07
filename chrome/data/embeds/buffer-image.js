;(function () {
    
    var config = {};
    config.endpoint = {
        http: "http://static.bufferapp.com/js/button.js",
        https: "https://d389zggrogs7qo.cloudfront.net/js/button.js"
    };
    config.image = {
        attribute: 'data-buffer-id',
        size: {
            width: 100,
            height: 100,
            diagonal: 300
        },
        aspect: {
          max: 40,
          min: 0.4  
        },
        opacity: {
            idle: 0.2,
            active: 1
        }
    };
    config.position = {
        width: 55,
        height: 20,
        inset: 20
    };
    config.time = {
        tin: 300,
        tout: 300,
        delay: 600
    };
    
    var buttons = {};
    
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    var genid = function() {
       return (S4()+S4()+S4()+S4());
    };
    
    var bufferButton = function (id, image) {
        
        var hoverAction = null;
        
        image.setAttribute(config.image.attribute, id);
        
        var buttonwrap = document.createElement('div');
        buttonwrap.className = "buffer-image";
        buttonwrap.setAttribute('data-target', image.src);
        
        var anchor = document.createElement('a');
        anchor.className = "buffer-add-button";
        anchor.setAttribute('data-count', 'none');
        anchor.setAttribute('data-picture', image.src);
        anchor.setAttribute('data-url', '' + document.location);
        
        buttonwrap.appendChild(anchor);
        
        var script = document.createElement('script');
        if( document.location.protocol == "https:" ) script.src = config.endpoint.https;
        else script.src = config.endpoint.http;
        
        buttonwrap.appendChild(script);
        
        image.parentNode.insertBefore(buttonwrap, image);
        
        return {
          id: (function () { return id }()),
          elem: buttonwrap,
          image: image,
          hoverAction: hoverAction
        };
        
    };
    
    var addButton = function(image) {
        var id = '' + genid();
        
        var b = bufferButton(id, image);
        
        buttons[id] = b;
        
        $(b.elem).on('mouseover', function(e) {
            setTimeout(function () {
                if( b.hoverAction ) {
                    window.clearTimeout(b.hoverAction);
                }
            }, config.time.delay / 2);
        });
        
        updateButton(image, b.elem);
        
    };
    
    var updateButton = function(image, elem) {
        var size = {
            x: $(image).width(),
            y: $(image).height()
        };
        var offset = $(image).position();
        var position = {
            left: offset.left + size.x - (config.position.inset + config.position.width),
            top: offset.top + size.y - (config.position.inset + config.position.height)
        };
        $(elem).css({
            left: position.left,
            top: position.top,
            width: config.position.width,
            height: config.position.height
        })
        
    };

    var calcSize = function(size) {
        return Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5);
    };
    
    var calcGCD = function(size) {
        var a = size.x, b = size.y;
        var remander = 0;
        while (b !== 0) {
            remainder = a % b;
            a = b;
            b = remainder;
        }
        return Math.abs(a);
    };
    
    var calcAspect = function(size) {
        if ( ! size.x || ! size.y ) return 1;
        var gcd = calcGCD(size);
        return (size.x / gcd) / (size.y / gcd);
    };
    
    var checkSize = function(size) {
        
        if ( calcSize(size) < config.image.size.diagonal ) return false;
        if ( size.x < config.image.size.width ) return false;
        if ( size.y < config.image.size.height ) return false;
        var aspect = calcAspect(size);
        if ( aspect < config.image.aspect.min || aspect > config.image.aspect.max ) return false;
        
        return true;
        
    };

    $('body')
    .on('mouseover', 'img', function(e) {
        
        var size = {
            x: $(this).width(),
            y: $(this).height()
        };

        if ( ! checkSize(size) ) return;
        
        if( ! this.hasAttribute(config.image.attribute) ) {
            addButton(this);
        }
        
        var button = buttons[this.getAttribute(config.image.attribute)];
        
        updateButton(this, button.elem);
        
        if( button.hoverAction ) {
            window.clearTimeout(button.hoverAction);
        }
        
        $(button.elem).stop().animate({
            opacity: config.image.opacity.active
        }, config.time.tin);
       
    })
    .on('mouseout', 'img', function() {
        
        if( ! this.hasAttribute(config.image.attribute) ) return;

        var button = buttons[$(this).attr(config.image.attribute)];
        button.hoverAction = setTimeout(function() {
            $(button.elem).stop().animate({
                opacity: config.image.opacity.idle
            }, config.time.tout);
        }, config.time.delay);

    });
    
    $('img').each(function () {
        var size = {
            x: $(this).width(),
            y: $(this).height()
        };

        if ( checkSize(size) ) {
            addButton(this);
        } 
    });

}());