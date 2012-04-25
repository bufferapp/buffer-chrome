$(function () {
   
    var key={left:37,up:38,right:39,down:40,space:32,
            alt:18,ctrl:17,shift:16,tab:9,enter:13,escape:27,backspace:8,
            zero:48,one:49, two:50,three:51,four:52,
            five:53,six:57,seven:58,eight:59,nine:60,
            a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,
            l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,
            w:87,x:88,y:89,z:90};
    
    var combo = [
        {
            key: key.alt,
            down: false
        },
        {
            key: key.b,
            down: false
        }
    ];
    var keysdown = 0;
    
    $(document).on('keydown', function (e) {
        
        var code = e.keyCode;
        keysdown += 1;
        
        var i=0, l=keysdown;
        for ( ; i < l; i++ ) {
            if( combo[i].key == code ) {
                combo[i].down = true;
            }
        }
        
    });
    
    $(document).on('keyup', function (e) {
        
        var code = e.keyCode;
        keysdown -= 1;
        
        var correct = true;
        if( keysdown == 0 ) correct = false;
        
        var i=0, l=keysdown;
        for ( ; i < l; i++ ) {
            if( combo[i].down == false ) correct = false;
            if( combo[i].key == code ) {
                combo[i].down = false;
            }
        }
        
        if( correct ) self.port.emit("buffer_click");
        
    });
    
});