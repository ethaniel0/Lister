var express = require("express");
var PORT = process.env.PORT || 3001;
var app = express();
app.get('/api', function (req, res) {
    res.json({ message: "hello michael" });
});
app.listen(PORT, function () {
    console.log("Server listening on " + PORT);
});
