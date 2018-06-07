var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var multiparty = require('connect-multiparty');
var fs = require('fs');
var objectId = require('mongodb').ObjectID;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());

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
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    var data = new Date();
    var time_stamp = data.getTime();
    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;
    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;

    fs.rename(path_origem, path_destino, function(erro){
        if(erro){
            res.status(500).json({erro: erro});
            return;
        } 
        
        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }

        db.open(function(erro, mongoCliente){
            mongoCliente.collection('postagem', function(erro, collection){
                collection.insert(dados, function(erro, records){
                    if(erro){
                        res.json({status:'erro'});
                    } else {
                        res.json({status: 'Inclusão realizada com sucesso'});
                    }
    
                    mongoCliente.close();
                });
            });
        });
    });
});

app.get('/api', function(req, res){

    res.setHeader("Access-Control-Allow-Origin", "*");
    
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

app.get('/imagens/:imagem', function(req, res){
    
    var img = req.params.imagem;

    fs.readFile('./uploads/' + img, function(erro, content){
        if(erro){
            res.status(400).json(erro);
            return;
        }

        res.writeHead(200, {
            'content-type': 'image/jpg'
        });

        res.end(content);
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