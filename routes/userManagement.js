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


/* GET forgotten password page. */
router.get('/mot-de-passe-oublie', function(req, res) {
  function loadQuestion(req,res,mySqlClient){
    mySqlClient.query("SELECT * FROM `questions` WHERE 1", function(err, result){
      if(err){
        console.log(err);
        res.redirect('/')
      }
      else{
        console.log(result)
        res.render('recovery_pass/main', {
          title: 'Mot de passe oublié',
          description : 'Page pour récupérer un mot de passe',
          questions : result,
          entreprise : req.session.Nom_entreprise,
          lien : req.session.lien_web
        });
      }
    })

  }
  sqlCo(req,res,mysql,loadQuestion);
});

router.post('/logout', function(req,res){
    req.session.destroy();
    res.send('success');
});

router.post('/change-password', function(req,res){
  console.log(req.body)
  if(req.body.email && req.body.id_question && req.body.answer && req.body.pass){
      function checkUserQuest(req,res,mySqlClient){
        console.log('query')
        mySqlClient.query("SELECT reponse, mail, liaison_qu_ut.id_question, utilisateurs.ID_util FROM liaison_qu_ut INNER JOIN questions ON liaison_qu_ut.id_question = questions.ID_question INNER JOIN utilisateurs ON liaison_qu_ut.id_emp = utilisateurs.ID_util WHERE mail ='"+req.body.email+"'", function (err, result)
        {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
            res.send('error')
          }
          else {
            if(typeof result != 'undefined' && result[0]){
              console.log(result[0].reponse)
              if(result[0].reponse == req.body.answer){
                mySqlClient.query("UPDATE utilisateurs SET Password='"+req.body.pass+"' WHERE ID_util='"+result[0].ID_util+"'", function(){
                  mySqlClient.end();
                  res.send('success')
                })
              }
              else {
                mySqlClient.end();
                res.send('error')
              }
            }
            else{
              mySqlClient.end();
              res.send('error')
            }
          }
        });
      };

      sqlCo(req,res,mysql,checkUserQuest);
  }
  else{
    console.log("no values");
    res.send('error')}
});

module.exports = router;
