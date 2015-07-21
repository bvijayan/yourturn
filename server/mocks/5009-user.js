var express = require('express'),
    server = express();

var users = {
    npiccolotto: {
        email: 'nikolaus.piccolotto@zalando.de',
        name: 'Nikolaus Piccolotto'
    }
};

/** enable cors */
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

server.get('/users/:id', function(req,res){
    setTimeout( function() {
        var id = req.params.id;
        if (!users[id]) {
            res.status(404).send();
        }
        res.status(200).send(users[id]);
    }, Math.random() * 2000 );
});

module.exports = server;