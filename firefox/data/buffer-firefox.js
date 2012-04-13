var config = {};
config.attributes = [
    {
        name: "url",
        encode: function (val) {
            return encodeURIComponent(val);
        }
    },
    {
        name: "text",
        encode: function (val) {
            return encodeURIComponent(val);
        }
    }
];

self.port.on("buffer_data", function(data) {
    OverlayIframe(data, function() {
        self.port.emit("buffer_done");
    });
});