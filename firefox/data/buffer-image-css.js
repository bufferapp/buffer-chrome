$(function () {
    var style = document.createElement('style');
    style.innerHTML = '.buffer-image{position:absolute;width:55px;height:21px;background-color:transparent;box-shadow:0 0 5px rgba(0,0,0,.3);opacity:0.2;border-radius:4px;}.buffer-image:hover{box-shadow:0 0 5px rgba(0,0,0,.5);}.buffer-image:active{background-position:0 -40px;}.buffer-image iframe{border-radius:5px;}';
    $('head').append(style);
})