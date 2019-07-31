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

/* GET home page. */
router.get('/sadmin-creer', function(req, res) {
  console.log(req.session)
  if(req.session.accessToken){
    res.render('super_admin/main', {
      title: 'Ajouter super admin',
      description : 'Page de gestion des employés',
      accessToken : req.session.accessToken,
      entreprise : req.session.Nom_entreprise,
      lien : req.session.lien_web,
      email : req.session.email,
      id_entreprise : req.session.ID_entreprise });
  }else{
    res.redirect('/')
  }
});

router.get('/gestion-contrat', function(req, res)
{
    if(typeof req.session.accessToken != 'undefined'){
      sqlCo(req, res, mysql, gestContrat);
    }else{
      res.redirect('/')
    }
    function gestContrat(req, res, mySqlClient){
        mySqlClient.query("SELECT Nom_contrat, ID_contrat FROM contrats  WHERE id_entreprise='"+req.session.ID_entreprise+"'", function (err, result)
        {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
          }
          else
          {
            mySqlClient.end();
            res.render('super_admin/main', {
              title: 'Gestion contrat',
              type: 'home',
              description : 'Page de gestion des contrats',
              accessToken : req.session.accessToken,
              email : req.session.email,
              entreprise : req.session.Nom_entreprise,
              lien : req.session.lien_web,
              result : result,
              id_entreprise : req.session.ID_entreprise });
          }
        });
      }

});

router.get('/gestion-service', function(req, res)
{
    if(typeof req.session.accessToken != 'undefined'){
      sqlCo(req, res, mysql, gestService);
    }else{
      res.redirect('/')
    }
    function gestService(req, res, mySqlClient){
        mySqlClient.query("SELECT Nom_service, ID_service FROM services WHERE id_entreprise='"+req.session.ID_entreprise+"' ORDER BY Nom_service asc", function (err, result)
        {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
          }
          else
          {
            mySqlClient.end();
            res.render('super_admin/main', {
              title: 'Gestion service',
              type: 'home',
              description : 'Page de gestion des services',
              accessToken : req.session.accessToken,
              email : req.session.email,
              entreprise : req.session.Nom_entreprise,
              lien : req.session.lien_web,
              result : result,
              id_entreprise : req.session.ID_entreprise });
          }
        });
      }

});

router.get('/gestion-poste', function(req, res)
{
    if(typeof req.session.accessToken != 'undefined'){
      sqlCo(req, res, mysql, gestPoste);
    }
    else{
      res.redirect('/')
    }
    function gestPoste(req, res, mySqlClient){
        mySqlClient.query("SELECT Nom_poste, ID_poste, Nom_service, postes.id_service FROM postes INNER JOIN services ON services.ID_service = postes.id_service  WHERE services.id_entreprise='"+req.session.ID_entreprise+"'", function (err, result)
        {
          if(err)
          {
            console.log("err");
            mySqlClient.end();
          }
          else
          {
            mySqlClient.query("SELECT Nom_service, ID_service FROM services  WHERE id_entreprise='"+req.session.ID_entreprise+"' ORDER BY Nom_service asc", function (err, result2)
            {
              if(err)
              {
                console.log("err");
                mySqlClient.end();
              }
              else
              {
                  mySqlClient.end();
                  console.log(result);
                  res.render('super_admin/main', {
                    title: 'Gestion poste',
                    type: 'home',
                    description : 'Page de gestion des postes',
                    accessToken : req.session.accessToken,
                    email : req.session.email,
                    entreprise : req.session.Nom_entreprise,
                    lien : req.session.lien_web,
                    result : result,
                    result2 : result2,
                    id_entreprise : req.session.ID_entreprise });
              }
            });
          }
        });
      }
});

router.get('/sadmin-supprimer', function(req, res) {
  if(req.session.accessToken){
    function sDelete(req,res, mySqlClient){
      mySqlClient.query("SELECT Mail FROM utilisateurs WHERE id_entreprise='"+req.session.ID_entreprise+"' AND Admin ='2'", function (err, result, users)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else {

          mySqlClient.end();
          res.render('super_admin/main', {
            title: 'Supprimer super admin',
            description : 'Page de gestion des employés',
            accessToken : req.session.accessToken,
            entreprise : req.session.Nom_entreprise,
            users : result,
            lien : req.session.lien_web,
            email : req.session.email,
            id_entreprise : req.session.ID_entreprise });
        }
    });
  }
    sqlCo(req,res, mysql, sDelete);
  }else{
    res.redirect('/')
  }
});

router.get('/sadmin-modifier', function(req, res) {
  if(req.session && typeof req.session.email != 'undefined' && typeof req.session.accessToken != 'undefined'&& req.session.accessToken && req.session.email)
  {
    function sModify(req,res, mySqlClient){
      mySqlClient.query("SELECT Mail FROM utilisateurs WHERE id_entreprise='"+req.session.ID_entreprise+"' AND Admin ='2'", function (err, result, users)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else {

          mySqlClient.end();
          res.render('super_admin/main', {
          title: 'Modifier super admin',
          description : 'Page de gestion des employés',
            accessToken : req.session.accessToken,
            entreprise : req.session.Nom_entreprise,
            users : result,
            lien : req.session.lien_web,
            email : req.session.email,
            id_entreprise : req.session.ID_entreprise });
        }
    });
  }
    sqlCo(req,res, mysql, sModify);
  }
  else{
    res.redirect('/')
  }
});

router.get('/sadmin-mdp', function(req,res){
  if(req.session && typeof req.session.email != 'undefined' && typeof req.session.accessToken != 'undefined'&& req.session.accessToken && req.session.email)
  {
      function sMdp(req,res, mySqlClient){
        mySqlClient.query("SELECT Mail FROM utilisateurs WHERE id_entreprise='"+req.session.ID_entreprise+"' AND Admin ='2'", function (err, result, users)
        {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
          }
          else {

            mySqlClient.end();
            res.render('super_admin/main', {
            title: 'Modifier le mot de passe d\'un utilisateur',
            description : 'Page de gestion des employés',
              accessToken : req.session.accessToken,
              entreprise : req.session.Nom_entreprise,
              users : result,
              lien : req.session.lien_web,
              email : req.session.email,
              id_entreprise : req.session.ID_entreprise });
          }
      });
    }
      sqlCo(req,res, mysql, sMdp);
  }
  else{
    res.rendirect('/')
  }
});

function decodeBase64(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

/* POST login */
router.post('/ajouter-responsable', function(req,res)
{
  console.log(req.session);
  if (req.body.email && req.body.password && req.body.nom && req.body.prenom && req.body.poste && req.body.autorisation)
  {
    function add_responsable(req,res,mySqlClient)
    {
      mySqlClient.query("SELECT COUNT(mail) AS test FROM utilisateurs WHERE Mail='"+req.body.email+"'", function (err, result, fields)
      {
        if(result[0].test=="0")
        {
          if (req.body.autorisation==1) {
            var imageBuffer = decodeBase64(req.body.file);
            path_file = req.body.email.split('@')[0]+".jpg";
            fs.writeFile("./public/img/signatures/"+path_file, imageBuffer.data, function(err){
              if(err){console.log(err)}
            });
          }
          mySqlClient.query("INSERT INTO utilisateurs (Mail, Password, Admin, id_entreprise, Nom_utilisateur, Prenom_utilisateur, Poste_utilisateur, Autorisation, Modifier) VALUES ('"+req.body.email+"', '"+req.body.password+"', '2', '"+req.session.ID_entreprise+"', '"+req.body.nom.replace(/'/g, "\'\'")+"', '"+req.body.prenom.replace(/'/g, "\'\'")+"', '"+req.body.poste.replace(/'/g, "\'\'")+"', '"+req.body.autorisation+"','"+req.body.modification+"')");
          res.send('success');
          mySqlClient.end();
          console.log("réussi");
        }
        else
        {
          res.send('error');
          mySqlClient.end();
          console.log("erreur")
        }
      });
    }
    sqlCo(req,res,mysql, add_responsable);
  }
  else
  {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/supprimer_responsable', function(req,res){
  if (req.body.email){
    function delete_responsable(req,res,mySqlClient){
      mySqlClient.query("SELECT COUNT(mail) AS test FROM utilisateurs WHERE Mail='"+req.body.email+"'", function (err, result, fields){
        if(result[0].test=="1"){
          mySqlClient.query("DELETE FROM utilisateurs WHERE Mail = '"+req.body.email+"'");
          mySqlClient.end();
          res.send('success');
        }
        else{
          mySqlClient.end();
          res.send('error');
        }
      });
    }
    sqlCo(req,res,mysql, delete_responsable);
  }
  else {
    res.send('error');
    mySqlClient.end();
  }
});

router.post('/modifier_responsable', function(req,res){
  if (req.body.email && req.session.accessToken){
    function modifier_responsable(req,res,mySqlClient){
      mySqlClient.query("SELECT COUNT(mail) AS test FROM utilisateurs WHERE Mail='"+req.body.email+"'", function (err, result, fields){
        if(result[0].test=="1"){
          if (req.body.autorisation==1) {
            var imageBuffer = decodeBase64(req.body.file);
            path_file = req.body.email.split('@')[0]+".jpg";
            fs.writeFile("./public/img/signatures/"+path_file, imageBuffer.data, function(err){
              if(err){console.log(err)}
            });
          }
          mySqlClient.query("UPDATE utilisateurs SET Autorisation='"+req.body.autorisation+"', Modifier ='"+req.body.modification+"' WHERE Mail = '"+req.body.email+"'");
          mySqlClient.end();
          res.send('success');
        }
        else{
          mySqlClient.end();
          res.send('error');
        }
      });
    }
    sqlCo(req,res,mysql, modifier_responsable);
  }
  else {
    res.send('error');
    mySqlClient.end();
  }
});

router.post('/reinitialize-pass', function(req,res){
  if(req.body.email && req.body.password){
    function changePassword(req,res,mySqlClient)
    {
      mySqlClient.query("UPDATE utilisateurs SET Password = '"+req.body.password+"' WHERE Mail='"+req.body.email+"'", function (err, result, fields)
      {
        if(err){console.log(err);
        mySqlClient.end();
        res.send('error'); }
        else{
          mySqlClient.end();
          res.send('success');
        }
      });
    }
    sqlCo(req,res,mysql, changePassword);
  }
})

router.post('/ajouter_Poste', function(req,res){
  if (req.body.nom && req.body.service){
    function add_Poste(req,res,mySqlClient){
      mySqlClient.query("INSERT INTO postes (Nom_poste, id_entreprise, id_service) VALUES ('"+req.body.nom+"', '"+req.session.ID_entreprise+"', '"+req.body.service+"')"); //Remplacer le 1 par id_entreprise
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, add_Poste);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/delete_Poste/:id', function(req,res){
  if (req.params.id ){
    function delete_Poste(req,res,mySqlClient){
      mySqlClient.query("DELETE FROM postes WHERE ID_poste = '"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, delete_Poste);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/modifier_Poste/:id', function(req,res){
  if (req.body.nom && req.body.service){
    console.log(req.body.nom);
    function edit_Poste(req,res,mySqlClient){
      mySqlClient.query("UPDATE postes SET Nom_poste='"+req.body.nom+"', id_service='"+req.body.service+"' WHERE ID_poste='"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, edit_Poste);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/ajouter_Contrat', function(req,res){
  if (req.body.nom ){
    function add_Contrat(req,res,mySqlClient){
      mySqlClient.query("INSERT INTO contrats (Nom_contrat, id_entreprise) VALUES ('"+req.body.nom+"', '"+req.session.ID_entreprise+"')"); //Remplacer le 1 par id_entreprise
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, add_Contrat);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/delete_Contrat/:id', function(req,res){
  if (req.params.id ){
    function delete_Contrat(req,res,mySqlClient){
      mySqlClient.query("DELETE FROM contrats WHERE ID_contrat = '"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, delete_Contrat);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/modifier_Contrat/:id', function(req,res){
  if (req.body.nom ){
    console.log(req.body.nom);
    function edit_Contrat(req,res,mySqlClient){
      mySqlClient.query("UPDATE contrats SET Nom_contrat='"+req.body.nom+"' WHERE ID_contrat='"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, edit_Contrat);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/ajouter_Service', function(req,res){
  if (req.body.nom ){
    function add_Service(req,res,mySqlClient){
      mySqlClient.query("INSERT INTO services (Nom_service, id_entreprise) VALUES ('"+req.body.nom+"', '"+req.session.ID_entreprise+"')"); //Remplacer le 1 par id_entreprise
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, add_Service);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/delete_Service/:id', function(req,res){
  if (req.params.id){
    function delete_Service(req,res,mySqlClient){
      mySqlClient.query("DELETE FROM services WHERE ID_service = '"+req.params.id+"'");
      mySqlClient.query("DELETE FROM postes WHERE id_service = '"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, delete_Service);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/modifier_Service/:id', function(req,res){
  if (req.body.nom ){
    console.log(req.body.nom);
    function edit_Service(req,res,mySqlClient){
      mySqlClient.query("UPDATE services SET Nom_service='"+req.body.nom+"' WHERE ID_service='"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, edit_Service);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});


module.exports = router;
