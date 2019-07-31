var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require("fs");
const config = require('../config.json');
var sqlCoInfo = config.db_conn;
var baseUrl = config.baseUrl;
function sqlCo(req, res, mysql, fct){
  var mySqlClient = mysql.createConnection(sqlCoInfo);
  mySqlClient.connect((err) => {
    if(err){
      console.log('Error connecting to Db');
      res.send('error');
    }
    else{
      console.log('Connected to database');
      fct(req,res,mySqlClient);
    }
  });
}

function decodeBase64(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
}

router.get('/entreprise-ajouter', function(req,res){
  if(req.session.accessToken){
    res.render('mega_admin/main', {
      title: 'Entreprise ajouter',
      description : 'Page de gestion des entreprises',
      accessToken : req.session.accessToken,
      entreprise : req.session.Nom_entreprise,
      lien : req.session.lien_web,
      email : req.session.email });
  }else{
    res.redirect('/')
  }
});

router.get('/entreprise-modifier/:id', function(req,res){
  if(req.params.id && req.session.accessToken){
    function edit_Ent(req,res,mySqlClient){
      mySqlClient.query("SELECT * FROM entreprise WHERE ID_entreprise='"+req.params.id+"'", function (err, result, fields)
      {
          if(err){
            console.log(err);
            mySqlClient.end();
            res.send('error');
          }
          else {
            mySqlClient.end();
            res.render('mega_admin/main', {
              title: 'Entreprise modifier',
              description : 'Page de gestion des entreprises',
              accessToken : req.session.accessToken,
              entreprise : req.session.Nom_entreprise,
              lien : req.session.lien_web,
              email : req.session.email,
              result: result[0] });
          }
      });
    }
    sqlCo(req,res,mysql, edit_Ent);
  }
  else {
    res.redirect('/');
  }
});

router.post('/ajouter-entreprise', function(req,res){
  if (req.body.Nom_entreprise && req.body.lien_web && req.body.mail && req.body.password && req.body.adresse && req.body.ville)
  {
    function add_Poste(req,res,mySqlClient){
      mySqlClient.query("INSERT INTO entreprise (Nom_entreprise, lien_web, adresse, ville) VALUES ('"+req.body.Nom_entreprise.replace(/'/g, "\'\'")+"', '"+req.body.lien_web+"', '"+req.body.adresse.replace(/'/g, "\'\'")+"', '"+req.body.ville.replace(/'/g, "\'\'")+"')", function (err, result, fields)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
          res.send('error');
        }
        else
        {
          mySqlClient.query("SELECT ID_entreprise FROM entreprise WHERE Nom_entreprise='"+req.body.Nom_entreprise.replace(/'/g, "\'\'")+"'", function (err, result, fields)
          {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
            res.send('error');
          }
          else
          {
            if(req.body.file){
              var imageBuffer = decodeBase64(req.body.file);
              path_file = result[0].ID_entreprise+".jpg";
              fs.writeFile("./public/img/logo/"+path_file, imageBuffer.data, function(err){
                if(err){console.log(err)}
              });
            }
            mySqlClient.query("INSERT INTO utilisateurs (Mail, Password, Admin, id_entreprise) VALUES ('"+req.body.mail+"', '"+req.body.password+"', '1', '"+result[0].ID_entreprise+"')", function(err, result){
              if(err){
                console.log(err);
                mySqlClient.end();
                res.send('error');
              }
              else{
                mySqlClient.end();
                res.send('success');
              }
            });
          }
          });
        }
      });
    }
    sqlCo(req,res,mysql, add_Poste);
  }
});

router.post('/modifier-entreprise/:id', function(req,res){
  if (req.body.Nom_entreprise && req.body.lien_web && req.body.adresse && req.body.ville)
  {
    function edit_Ent(req,res,mySqlClient){
          mySqlClient.query("SELECT ID_entreprise FROM entreprise WHERE Nom_entreprise='"+req.body.Nom_entreprise.replace(/'/g, "\'\'")+"'", function (err, result, fields)
          {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
            res.send('error');
          }
          else
          {
            if(req.body.file){
              var imageBuffer = decodeBase64(req.body.file);
              path_file = result[0].ID_entreprise+".jpg";
              fs.writeFile("./public/img/logo/"+path_file, imageBuffer.data, function(err){
                if(err){console.log(err)}
              });
            }
            mySqlClient.query("UPDATE entreprise SET Nom_entreprise='"+req.body.Nom_entreprise.replace(/'/g, "\'\'")+"', Lien_web='"+req.body.lien_web+"', Adresse='"+req.body.adresse.replace(/'/g, "\'\'")+"', Ville='"+req.body.ville.replace(/'/g, "\'\'")+"' WHERE ID_entreprise='"+req.params.id+"'");
            mySqlClient.end();
            res.send('success')
          }
        });
    }
    sqlCo(req,res,mysql, edit_Ent);
  }
});

module.exports = router;
