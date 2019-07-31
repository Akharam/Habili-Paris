var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const uuid = require('uuid');
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

function checkUser(req,res, mySqlClient,sqlCo,fct){
  if(req.session.id && req.session.email && req.session.accessToken){
    sqlCo(req,res,mysql,fct)
  }
  else{
    res.redirect('/')
  }
}

/* GET home page. */
router.get('/', function(req, res)
{
  console.log(req.session);
  if(req.session && typeof req.session.email != 'undefined' && typeof req.session.accessToken != 'undefined'&& req.session.accessToken && req.session.email)
  {
    function displayHome(req, res, mySqlClient){
      var query = "SELECT employe.ID_emp as ID_emp, Token_qr, nom_emp, prenom_emp, liaison_emp_cert.id_certif, nom_certif, Maxtime, DATEDIFF( Maxtime, now()) AS diff, DATE_FORMAT(Maxtime, '%d/%m/%Y') AS MaxTime, niveau FROM( SELECT MaxTime, employe.id_emp, liaison_emp_cert.id_certif, nom_certif, CASE WHEN MaxTime BETWEEN now() AND now() + INTERVAL 120 DAY THEN 'soon' WHEN MaxTime + INTERVAL Periode_souplesse MONTH < now() THEN 'mort' WHEN MaxTime > now() + INTERVAL 120 DAY THEN 'NP' WHEN now() < MaxTime + INTERVAL Periode_souplesse MONTH THEN 'souplesse' WHEN MaxTime IS NULL THEN '' END AS niveau FROM ( SELECT liaison_emp_cert.id_certif, MAX(Date_fin) as MaxTime, employe.id_emp FROM employe LEFT OUTER JOIN liaison_emp_cert ON employe.ID_emp = liaison_emp_cert.id_emp GROUP BY id_certif, id_emp) liaison_emp_cert INNER JOIN certifications ON certifications.ID_certif=liaison_emp_cert.id_certif INNER JOIN employe  ON employe.ID_emp=liaison_emp_cert.id_emp )liaison_emp_cert INNER JOIN employe ON employe.ID_emp = liaison_emp_cert.id_emp WHERE actif = 1 AND employe.id_entreprise ='"+req.session.ID_entreprise+"' ORDER BY diff DESC";
      mySqlClient.query(query, function (err, result, fields){
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else if(req.session.admin=="1"){
          mySqlClient.end();
          res.render('super_admin/main', {
          title: 'Accueil super admin',
          description : 'Page d\'accueil super admin',
          accessToken : req.session.accessToken,
          email : req.session.email,
          entreprise : req.session.Nom_entreprise,
          lien : req.session.lien_web,
          id_entreprise : req.session.ID_entreprise
          });
        }
        else if(req.session.admin=="5"){
          var requete = "SELECT ID_entreprise, Nom_entreprise, Adresse, Ville FROM entreprise WHERE ID_entreprise != '1'";
          mySqlClient.query(requete, function (err, result, fields){
            if(err)
            {
              console.log(err);
              mySqlClient.end();
            }
            else {
              mySqlClient.end();
              res.render('mega_admin/main', {
              title: 'Entreprise',
              description : 'Page d\'accueil mega admin',
              accessToken : req.session.accessToken,
              email : req.session.email,
              result: result
              });
            }
          });
        }
        else {
          mySqlClient.end();
          console.log(result);
          res.render('home/main', {
          title: 'Accueil',
          description : 'Page d\'accueil',
          accessToken : req.session.accessToken,
          email : req.session.email,
          entreprise : req.session.Nom_entreprise,
          lien : req.session.lien_web,
          id_entreprise : req.session.ID_entreprise,
          result : result
          });
        }
      });
    }
    sqlCo(req, res, mysql, displayHome);
  }
    else{
      res.render('connexion/main', {
        title: 'Connexion',
        description : 'Page de connexion'});
    }
});

/* POST login */
router.post('/login', function(req,res){

  if (req.body.email && req.body.password){
      function login(req,res,mySqlClient){
        mySqlClient.query("SELECT Nom_utilisateur,Modifier, Prenom_utilisateur, Poste_utilisateur, autorisation, Mail, ID_util, admin, entreprise.ID_entreprise, Nom_entreprise, entreprise.Adresse as Adresse, entreprise.Ville as Ville, lien_web FROM utilisateurs INNER JOIN entreprise ON utilisateurs.id_entreprise = entreprise.id_entreprise WHERE Mail='"+req.body.email+"' and Password='"+req.body.password+"'", function (err, result) {
          if(err){
            console.log(err);
            res.send('error');
            mySqlClient.end();
          }
          else{
            console.log("query done")
            if(result && result[0] && result[0].Mail && result[0].ID_util){
                var access_token = uuid().split('-').join('')
                req.session.accessToken = access_token;
                req.session.email = result[0].Mail;
                req.session.nom = result[0].Prenom_utilisateur+" "+result[0].Nom_utilisateur;
                req.session.poste = result[0].Poste_utilisateur;
                req.session.autorisation = result[0].autorisation;
                req.session.id = result[0].ID_util;
                req.session.admin = result[0].admin;
                req.session.modifier = result[0].Modifier;
                req.session.ville_entreprise = result[0].Ville;
                req.session.adresse_entreprise = result[0].Adresse;
                req.session.ID_entreprise = result[0].ID_entreprise;
                req.session.Nom_entreprise = result[0].Nom_entreprise;
                req.session.lien_web = result[0].lien_web;
                mySqlClient.query("INSERT INTO tokens (Token_co,id_emp,Date_co) VALUES ('"+access_token+"', '"+result[0].ID_util+"', now())");
                res.send('success');
                mySqlClient.end();
            }
            else{
              res.send('error');
              mySqlClient.end();
            }
          }
        });
      }
      sqlCo(req,res,mysql, login);
  }
  else{
    res.send('error')
  }
})

router.get('/logout',function(req,res){
  req.session.destroy();
  res.redirect('/');
})


router.post('/change-pass', function(req,res){
  if(req.session.accessToken && req.session.email){
      function changePass(req,res, mySqlClient){
        mySqlClient.query("UPDATE utilisateurs SET Password='"+req.body.password+"' WHERE Mail='"+req.session.email+"'", function (err, result) {
          if(err){
            res.send('error');
            mySqlClient.end();
          }
          else{
            mySqlClient.end();
            res.send('success');
          }
      });
    }
      sqlCo(req,res,mysql, changePass)
  }
  else{
    res.send('error')
  }
})
module.exports = router;
