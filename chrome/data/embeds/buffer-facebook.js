;(function() {

    // EXT
    // (obj notation)
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

    // Listen for share button clicks

    var share = {};
    $('body').on('click', 'a.share_action_link', function (e) {
        console.log("click");
        var parent = $(this).closest('.genericStreamStory');
        share.via = $(parent).find('.actorName').text();
        share.text = $(parent).find('.messageBody').text();
        share.url = $(parent).find('.uiStreamSource a').attr('href');
        var small_img = $(parent).find('.uiPhotoThumb img').attr('src');
        console.log(share);
        if( small_img ) {
            var img = small_img.replace(/s[0-9]+x[0-9]+\//, '')
            console.log(small_img, img);
            share.image = img;
            share.url = $(parent).find('.uiPhotoThumb').attr('href');
        }
        console.log(share);
    });
    
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
            after: '.privacyWidget',
            className: 'buffer-facebook-button',
            selector: '.buffer-facebook-button',
            elements:
                    ['li', 'pls uiListItem uiListHorizontalItemBorder uiListHorizontalItem', '',
                        ['label', '', '',
                            ['a', 'buffer-facebook-button']
                        ]
                    ],
            default: 'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
            style:   'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
            hover:   'background: hsl(116, 39%, 42%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); text-decoration: none;',
            active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
            create: function (btnConfig) {
                
                var temp = buildElement(btnConfig.elements);
                
                var a = $(temp).find(btnConfig.selector)[0];
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
            container: 'div.dialogFooter',
            before: '.uiButtonConfirm',
            className: 'buffer-facebook-button',
            selector: '.buffer-facebook-button',
            elements: ['a', 'buffer-facebook-button uiOverlayButton uiButton uiButtonLarge'],
            default: 'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 6px 4px;',
            style:   'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 6px 4px;',
            hover:   'background: hsl(116, 39%, 42%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); text-decoration: none;',
            active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
            create: function (btnConfig) {
                
                var temp = buildElement(btnConfig.elements);

                console.log(temp);
                
                var a = $(temp).find(btnConfig.selector)[0];
                if( ! a ) a = temp; // EXT
                a.setAttribute('style', btnConfig.default);
                a.setAttribute('href', '#');
                $(a).text(btnConfig.text); // EXT req jQuery? :/ jqmob?

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
                var parent = $(elem).closest('.uiDialog');
                var text = $(parent).find('div.uiMentionsInput textarea').val();
                if( text === "Write something" ) text = undefined;
                if( share.url ) {
                    if( text ) share.text = text;
                    console.log(share);
                    return share;
                } else {
                    return text;
                }
            },
            clear: function (elem) {
                share = {};
                $(elem).closest('.uiDialog').find('.layerCancel').click();
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

                    // EXT
                    if ( btnConfig.after ) $(container).find(btnConfig.after).after(btn);
                    else if ( btnConfig.before ) $(container).find(btnConfig.before).before(btn);
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