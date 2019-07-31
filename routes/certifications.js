var express = require('express');
var router = express.Router();
var mysql = require('mysql');
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
router.get('/certifications', function(req, res)
{
    console.log(req.session);
    if(req.session.accessToken){
        function displayHome(req, res, mySqlClient){
          mySqlClient.query("SELECT nom_certif, duree_valide, ID_certif, Periode_souplesse, Description_certif FROM certifications WHERE id_entreprise='"+req.session.ID_entreprise+"' ORDER By Nom_certif", function (err, result)
          {
            if(err)
            {
              console.log(err);
              mySqlClient.end();

            }
            else
            {
              mySqlClient.end();
              res.render('habilitations/main', {
                title: 'Certifications',
                type: 'home',
                description : 'Page de gestion des certifications',
                accessToken : req.session.accessToken,
                email : req.session.email,
                modifier : req.session.modifier,
                entreprise : req.session.Nom_entreprise,
                lien : req.session.lien_web,
                id_entreprise : req.session.ID_entreprise,
                result : result });
            }
          });
        }
        sqlCo(req, res, mysql, displayHome);
    }
    else{
      res.redirect('/');
    }
});

router.get('/certifications/ajouter', function(req, res){
    if(req.session.accessToken && req.session.modifier == 1){
      function addCertif(req, res, mySqlClient)
      {
            mySqlClient.query("SELECT nom_contrat FROM contrats", function (err, contracts)
            {
            if(err)
            {
              console.log(err);
              mySqlClient.end();
            }
            else
            {
              mySqlClient.query("SELECT ID_service, nom_service FROM services", function (err, services)
              {
              if(err)
              {
                console.log(err);
                mySqlClient.end();
              }
              else
              {
                mySqlClient.query("SELECT nom_poste, ID_service FROM postes", function (err, postes)
                {
                if(err)
                {
                  console.log(err);
                  mySqlClient.end();
                }
                else
                {
                  mySqlClient.end();
                  res.render('habilitations/main', {
                  title: 'Ajouter certifications',
                  type: 'add',
                  description : 'Page de gestion des certifications',
                  accessToken : req.session.accessToken,
                  email : req.session.email,
                  entreprise : req.session.Nom_entreprise,
                  id_entreprise : req.session.ID_entreprise,
                  lien : req.session.lien_web,
                  contracts : contracts,
                  services : services,
                  postes : postes});
                }
                });
              }
              });
            }
            });
          }
      sqlCo(req, res, mysql, addCertif);
    }
    else{
      res.redirect('/')
    }

});

router.get('/certifications/modifier/:id', function(req, res){
  if(req.params.id && req.session.accessToken && req.session.modifier){
    function  editCertif(req, res, mySqlClient)
    {
      mySqlClient.query("SELECT * FROM certifications WHERE ID_certif = '"+req.params.id+"'", function (err, habilitations_infos)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else
        {
          mySqlClient.end();
          res.render('habilitations/main', {
            title: 'Editer certifications',
            type: 'edit',
            description : 'Page de gestion des certifications',
            accessToken : req.session.accessToken,
            email : req.session.email,
            entreprise : req.session.Nom_entreprise,
            lien : req.session.lien_web,
            id_entreprise : req.session.ID_entreprise,
            habilitations_infos : habilitations_infos[0]
          });
        }
      });
    }
    sqlCo(req, res, mysql, editCertif);
  }
  else{
    res.redirect('/')
  }
});

router.post('/ajouter-certif', function(req,res){
  if (req.body.nom && req.body.duree && req.body.souplesse){
    function ajouter_certif(req,res,mySqlClient){
      if(!req.body.desc){
        req.body.desc= "";
      }
      mySqlClient.query("INSERT INTO certifications (Nom_certif, Duree_valide, Description_certif, Periode_souplesse, id_entreprise) VALUES ('"+req.body.nom+"', '"+req.body.duree+"', '"+req.body.desc+"', '"+req.body.souplesse+"', '"+req.session.ID_entreprise+"')");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, ajouter_certif);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/modifier-certif/:id', function(req,res){
  if (req.body.nom && req.body.duree && req.params.id ){
    function modifier_certif(req,res,mySqlClient){
      if(!req.body.desc){
        req.body.desc= "";
      }
      mySqlClient.query("UPDATE certifications SET Nom_certif='"+req.body.nom+"', Duree_valide='"+req.body.duree+"', Description_certif='"+req.body.desc+"', Periode_souplesse='"+req.body.souplesse+"' WHERE ID_certif = '"+req.params.id+"'");
      res.send('success');
      mySqlClient.end();
      console.log("réussi");
    }
    sqlCo(req,res,mysql, modifier_certif);
  }
  else {
    res.send('error');
    mySqlClient.end();
    console.log("echec");
  }
});

router.post('/deleteCertif/:id', function(req,res){
  console.log("test");
  if(req.params.id){
    function deleteCert(req,res,mySqlClient){
      mySqlClient.query("DELETE FROM certifications WHERE ID_certif='"+req.params.id+"'", function (err, result, fields)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
          res.send('error');
        }
        else
        {
          mySqlClient.end();
          res.send('success');
        }
      });
    }
    sqlCo(req,res,mysql, deleteCert);
  }
  else{
    res.send('error')
  }
})

module.exports = router;
