;(function() {

    $('head').append('<style> .tweet .action-buffer-container i, .tweet.opened-tweet .action-buffer-container i, .tweet.opened-tweet.hover .action-buffer-container i  { background-position: -3px -3px; } .tweet.hover .action-buffer-container i { background-position: -3px -21px; }');

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
        success: {
            delay: 2000
        }
    };
    config.buttons = [
        {
            name: "composer",
            text: "Buffer",
            container: 'div.tweet-button-sub-container',
            after: 'input.tweet-counter',
            default: '',
            className: 'buffer-tweet-button btn disabled',
            selector: '.buffer-tweet-button',
            style: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className);
                a.setAttribute('style', btnConfig.default);
                a.setAttribute('href', '#');
                $(a).text(btnConfig.text);

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

                return a;

            },
            ignore: function(container) {
                if( $(container).closest('.dm-dialog').length > 0 ) return true;
                return false;
            },
            data: function (elem) {
                return $(elem).parents('.tweet-button-container').siblings('.text-area').find('.twitter-anywhere-tweet-box-editor').val();
            },
            clear: function (elem) {
                $('.twitter-anywhere-tweet-box-editor').val(' ');
            },
            activator: function (elem, btnConfig) {
                var target = $(elem).parents('.tweet-button-container').siblings('.text-area').find('.twitter-anywhere-tweet-box-editor');
                $(target).on('keyup focus blur change paste cut', function (e) {
                    var val = $(this).val();
                    var counter = $(elem).siblings('.tweet-counter').val();
                    if ( val.length > 0 && counter > -1 && val !== "Compose new Tweet...") {
                        $(elem).removeClass('disabled').attr('style', btnConfig.style);
                    } else {
                        $(elem).addClass('disabled').attr('style', btnConfig.default);
                    }
                });
            }
        },
        {
            name: "retweet",
            text: "Buffer Retweet",
            container: '#retweet-dialog div.twttr-prompt',
            after: 'div.js-prompt-ok',
            className: 'buffer-tweet-button btn',
            selector: '.buffer-tweet-button',
            default: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            style: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 8px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className);
                a.setAttribute('style', btnConfig.default);
                a.setAttribute('href', '#');
                $(a).text(btnConfig.text);

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

                return a;

            },
            data: function (elem) {
                var c = $(elem).parents().siblings('.twttr-dialog-reply-footer');
                return 'RT @' + c.find('.twttr-reply-screenname').text().trim() + ': ' + c.find('.js-tweet-text').text().trim() + '';
            }   
        },
        {
            name: "twitter-button",
            text: "Buffer",
            container: 'div.ft',
            after: '#char-count',
            default: 'margin-right: 8px; background: #eee; background: -webkit-linear-gradient(bottom, #eee 25%, #f8f8f8 63%); border: 1px solid #999; color: #444 !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;',
            className: 'button',
            selector: '.button',
            style: 'margin-right: 8px; background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className);
                a.setAttribute('style', btnConfig.default);
                a.setAttribute('href', '#');
                $(a).text(btnConfig.text);

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

                return a;

            },
            data: function (elem) {
                return $(elem).parents('.ft').siblings('.bd').find('#status').val();
            },
            clear: function (elem) {
                window.close();
            },
            activator: function (elem, btnConfig) {
                var target = $(elem).parents('.ft').siblings('.bd').find('#status');
                var activate = function () {
                    var val = $(target).val();
                    var counter = $(elem).siblings('#char-count').val();
                    if ( val.length > 0 && counter > -1) {
                        $(elem).removeClass('disabled').attr('style', btnConfig.style);
                    } else {
                        $(elem).addClass('disabled').attr('style', btnConfig.default);
                    }
                };
                $(target).on('keyup focus blur change paste cut', function (e) {
                    activate();
                });             
                activate();
            }
        },
        {
            name: "buffer-permalink-action",
            text: "Buffer",
            container: '.permalink div.stream-item-footer .tweet-actions',
            after: '.action-fav-container',
            default: '',
            className: 'buffer-action',
            selector: '.buffer-action',
            style: '',
            hover: '',
            active: '',
            create: function (btnConfig) {

                var li = document.createElement('li');
                li.className = "action-buffer-container";

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className + " with-icn");
                a.setAttribute('href', '#')

                var i = document.createElement('i');
                i.setAttribute('class', 'sm-embed'); // let Twitter set the bg color
                i.setAttribute('style', 'top: -1px; position: relative; margin-right: 4px; width: 16px; height: 16px; top: -1px; background-image: url(' + self.data.get('data/img/twttr-sprite.png') + '); background-repeat: no-repeat; background-position: -5px -5px;');

                $(a).append(i);

                var b = document.createElement('b');
                $(b).text(btnConfig.text);

                $(a).append(b);

                $(li).append(a);

                return li;


            },
            data: function (elem) {
                var c = $(elem).closest('.tweet');
                return 'RT ' + c.find('.username').text().trim() + ': ' + c.find('.tweet-text').text().trim() + '';
            },
            clear: function (elem) {
            },
            activator: function (elem, btnConfig) {
            }
        },
        {
            name: "buffer-action",
            text: "Buffer",
            container: '.stream div.stream-item-footer .tweet-actions',
            after: '.action-fav-container',
            default: '',
            className: 'buffer-action',
            selector: '.buffer-action',
            style: '',
            hover: '',
            active: '',
            create: function (btnConfig) {

                var li = document.createElement('li');
                li.className = "action-buffer-container";

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className + " with-icn");
                a.setAttribute('href', '#')

                var i = document.createElement('i');
                i.setAttribute('class', 'sm-embed'); // let Twitter set the bg colors
                i.setAttribute('style', 'position: relative; top: 0px; margin-right: 4px; width: 13px; height: 13px; background-image: url(' + self.data.get('data/img/twttr-sprite-small.png') + '); background-repeat: no-repeat;');

                $(a).append(i);

                var b = document.createElement('b');
                $(b).text(btnConfig.text);

                $(a).append(b);

                $(li).append(a);

                return li;


            },
            data: function (elem) {
                var c = $(elem).closest('.tweet');
                var text = c.find('.js-tweet-text');
                $(text).children('a').each(function () {
                    if( $(this).attr('data-screen-name') ) return;
                    var original = $(this).text();
                    $(this).text($(this).attr("href"));
                    var that = this;
                    setTimeout(function () {
                        $(that).text(original);
                    }, 100);
                });
                return 'RT ' + c.find('.username').text().trim() + ': ' + $(text).text() + '';

            },
            clear: function (elem) {
            },
            activator: function (elem, btnConfig) {
            }
        }
    ];

    var insertButtons = function () {

        var i, l=config.buttons.length;
        for ( i=0 ; i < l; i++ ) {

            var btnConfig = config.buttons[i];
            
            $(btnConfig.container).each(function () {
                
                var container = $(this);
                
                if( !! btnConfig.ignore ) {
                    if( btnConfig.ignore(container) ) return;
                }
                
                if ( $(container).hasClass('buffer-inserted') ) return;

                $(container).addClass('buffer-inserted');

                var btn = btnConfig.create(btnConfig);

                $(container).find(btnConfig.after).after(btn);

                if ( !! btnConfig.activator) btnConfig.activator(btn, btnConfig);
                
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

  ;(function bufferTwitter() {
    var source = "chrome";

    insertButtons();

    setTimeout(bufferTwitter, 500);

  }());
    
}());