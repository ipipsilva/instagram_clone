var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectID;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 8080;

app.listen(port, function(){
    console.log('Servidor HTTTP esta escutando na porta: ' + port);
});

var db = mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

app.get('/', function(req, res){
    res.send({msg:'Olá'});
});

app.post('/api', function(req, res){
    
    var dados = req.body;
    
    db.open(function(erro, mongoCliente){
        mongoCliente.collection('postagem', function(erro, collection){
            collection.insert(dados, function(erro, records){
                if(erro){
                    res.json(erro);
                } else {
                    res.json(records);
                }

                mongoCliente.close();
            });
        });
    });
});

app.get('/api', function(req, res){
    db.open(function(erro, mongoCliente){
        mongoCliente.collection('postagem', function(erro, collection){
            collection.find().toArray(function(erro, results){
                if(erro) {
                    res.json(erro);
                } else {
                    res.json(results);
                }
                mongoCliente.close();
            });
        });
    });
});

app.get('/api/:id', function(req, res){
    db.open(function(erro, mongoCliente){
        mongoCliente.collection('postagem', function(erro, collection){
            collection.find({_id: objectId(req.params.id)}).toArray(function(erro, results){
                if(erro) {
                    res.json(erro);
                } else {
                    res.json(results);
                }
                mongoCliente.close();
            });
        });
    });
});

app.put('/api/:id', function(req, res){
    db.open(function(erro, mongoCliente){
        mongoCliente.collection('postagem', function(erro, collection){
            collection.update(
                { _id : objectId(req.params.id)}, 
                { $set: {titulo: req.body.titulo} },
                {},
                function(erro, records){
                    if(erro) {
                        res.json(erro);
                    } else {
                        res.json(records);
                    }
                    mongoCliente.close();
            });
        });
    });
});

app.delete('/api/:id', function(req, res){
    db.open(function(erro, mongoCliente){
        mongoCliente.collection('postagem', function(erro, collection){
            collection.remove({_id: objectId(req.params.id)}, function(erro, records){
                if(erro) {
                    res.json(erro);
                } else {
                    res.json(records);
                }

                mongoCliente.close();
            });
        });
    });
});