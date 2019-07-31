var express = require('express');
var router = express.Router();
var fs = require("fs");
var PdfDocument = require('pdfkit');
var signer = require('node-signpdf');
var PdfTable = require('voilab-pdf-table');
var mysql = require('mysql');
var qrcode = require('qrcode');
const pdf2base64 = require('pdf-to-base64');
const uuidv1 = require('uuid/v1');
var crypto = require('crypto');

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


function createCard(id, mySqlClient, req){
  var query = "SELECT ID_emp, Nom_emp, Prenom_emp, Photo_emp, Token_qr, id_entreprise FROM employe WHERE ID_emp='"+id+"'";
  mySqlClient.query(query, function (err, info_user){
    if(err)
    {
      console.log(err);
    }
    else
    {
      qrcode.toDataURL(baseUrl+"/employe/"+info_user[0].ID_emp+"/"+info_user[0].Token_qr, function (err, url) {
        var doc = new PdfDocument({
          size: [245,154]
        });
        doc.fontSize(8);

        doc.text(""+info_user[0].Nom_emp.toUpperCase()+" "+info_user[0].Prenom_emp.trim(), 130,110,{
          align : "left",
          width : 245,
          height : 154
        })

        if(fs.existsSync("./public/img/photo/"+info_user[0].Photo_emp)){
          doc.image('./public/img/photo/'+info_user[0].Photo_emp, 140,20, {
            height : 80
          })
        }

        if(fs.existsSync("./public/img/logo/"+info_user[0].id_entreprise+".jpg")){
          doc.image('./public/img/logo/'+info_user[0].id_entreprise+".jpg", 20,20, {
            height : 20,
            width : 90
          })
        }


        doc.image(url, 20, 40, {height: 90});

        doc.pipe(fs.createWriteStream('./public/carte/'+id+'.pdf'));
        doc.end();

      });

    }
});
}
/* GET home page. */
router.get('/employes', function(req, res)
{
      if(req.session.accessToken){
        function displayHome(req, res, mySqlClient){
          var query = "SELECT employe.ID_emp, employe.Token_qr, SUM(niveau) AS nb_certif_orange, nom_emp, prenom_emp, nom_contrat, Duree_visite_medicale as duree_visite_medicale, Passeport as passeport, nom_service, nom_poste, piece_identite, permis_conduire, photo_emp, DATE_FORMAT(visite_med, '%d/%m/%Y') AS visite_med, DATE_FORMAT(date_embauche, '%d/%m/%Y') AS date_embauche, actif FROM(SELECT MaxTime, employe.id_emp, liaison_emp_cert.id_certif,CASE WHEN MaxTime BETWEEN now() AND now() + INTERVAL 120 DAY THEN 1 WHEN MaxTime + INTERVAL Periode_souplesse MONTH < now() THEN 0 WHEN MaxTime > now() + INTERVAL 120 DAY THEN 0 WHEN now() < MaxTime + INTERVAL Periode_souplesse MONTH THEN 1 WHEN MaxTime IS NULL THEN 0 END AS niveau FROM ( SELECT liaison_emp_cert.id_certif, MAX(Date_fin) as MaxTime, employe.id_emp FROM employe LEFT OUTER JOIN liaison_emp_cert ON employe.ID_emp = liaison_emp_cert.id_emp GROUP BY id_certif, id_emp )liaison_emp_cert LEFT OUTER JOIN certifications ON certifications.ID_certif=liaison_emp_cert.id_certif LEFT OUTER JOIN employe ON employe.ID_emp=liaison_emp_cert.id_emp)liaison_emp_cert INNER JOIN employe ON employe.ID_emp = liaison_emp_cert.id_emp INNER JOIN contrats ON contrats.ID_contrat=employe.Contrat INNER JOIN postes ON employe.Poste=postes.ID_poste INNER JOIN services ON services.ID_service=postes.id_service WHERE employe.id_entreprise="+req.session.ID_entreprise+" GROUP BY employe.ID_emp"
          console.log(query)
          mySqlClient.query(query, function (err, result, fields)
          {
            if(err)
            {
              console.log(err);
              mySqlClient.end();
            }
            else
            {
              mySqlClient.end();
              console.log(result);
              res.render('employees/main', {
                title: 'Employés',
                type: 'home',
                description : 'Page de gestion des employés',
                accessToken : req.session.accessToken,
                email : req.session.email,
                modifier : req.session.modifier,
                lien : req.session.lien_web,
                entreprise : req.session.Nom_entreprise,
                id_entreprise : req.session.ID_entreprise,
                result : result });
            }
          });
        }
        sqlCo(req, res, mysql, displayHome);
      }else{
        res.redirect('/')
      }


});

router.get('/employe/ajouter', function(req, res){
    console.log(req.session);
    if(req.session.accessToken && req.session.modifier == 1){
      function addEmployees(req, res, mySqlClient){
            mySqlClient.query("SELECT ID_contrat, nom_contrat FROM contrats", function (err, contracts)
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
                mySqlClient.query("SELECT id_poste, concat(nom_service, ' - ', nom_poste) AS poste FROM postes INNER JOIN services ON services.ID_service = postes.id_service ORDER BY poste", function (err, postes)
                {
                if(err)
                {
                  console.log(err);
                  mySqlClient.end();
                }
                else
                {
                  console.log(contracts);
                  console.log(postes);
                  mySqlClient.end();
                      res.render('employees/main', {
                      title: 'Ajouter employé',
                      type: 'add',
                      user_info : {},
                      description : 'Page de gestion des employés',
                      accessToken : req.session.accessToken,
                      email : req.session.email,
                      contracts : contracts,
                      services : services,
                      lien : req.session.lien_web,
                      entreprise : req.session.Nom_entreprise,
                      id_entreprise : req.session.ID_entreprise,
                      postes : postes});

                }
                });
              }
              });
            }
            });
          }
      sqlCo(req, res, mysql, addEmployees);
    }
    else{
      res.redirect('/');
    }


});

router.get('/employe/edit/:id', function(req, res){

    if(req.params.id && req.session.accessToken && req.session.modifier == 1){
      function  editEmployee(req, res, mySqlClient){
        mySqlClient.query("SELECT * FROM certifications ORDER BY Nom_certif asc", function (err, all_certifications)
        {
          if(err){
            console.log(err);
            mySqlClient.end();
          }else{
          mySqlClient.query("SELECT liaison_emp_cert.ID_liaison, liaison_emp_cert.Fichier_certif,  certifications.ID_certif,  nom_certif,  DATE_FORMAT(date_passage, '%d/%m/%Y') AS date_passage, DATE_FORMAT(Date_fin, '%d/%m/%Y') AS Date_fin, DATEDIFF( Date_fin, now()) AS diff FROM certifications INNER JOIN liaison_emp_cert ON certifications.ID_certif = liaison_emp_cert.id_certif WHERE id_emp = '"+req.params.id+"' ORDER BY diff DESC", function (err, info_certifs)
          {
            if(err)
            {
              console.log(err);
              mySqlClient.end();
            }
            else
            {
                mySqlClient.query("SELECT id_poste, concat(nom_service, ' - ', nom_poste) AS poste FROM postes INNER JOIN services ON services.ID_service = postes.id_service ORDER BY poste", function (err, postes)
                {
                  if(err)
                  {
                    console.log(err);
                    mySqlClient.end();
                  }
                  else
                  {
                    mySqlClient.query("SELECT ID_contrat, nom_contrat FROM contrats", function (err, contracts)
                    {
                      if(err){
                      console.log(err);
                      mySqlClient.end();
                    }
                      else{
                      mySqlClient.query("SELECT ID_emp, Token_qr, Certificat_medical as certificat_medical, Duree_visite_medicale, Comment_visite_med, Passeport as passeport, Permis_conduire as permis_conduire, Photo_emp as photo_emp, Piece_identite as piece_identite, nom_emp, prenom_emp, contrat, DATE_FORMAT(date_embauche, '%Y-%m-%d') AS date_embauche,  poste, DATE_FORMAT(visite_med, '%Y-%m-%d') AS visite_med FROM employe WHERE id_emp='"+req.params.id+"'", function (err, info_user)
                        {
                            if(err)
                              {
                                console.log(err);
                                mySqlClient.end();
                              }
                              else
                              {
                                console.log(info_user[0]);
                                qrcode.toDataURL(baseUrl+"/employe/"+req.params.id+"/"+info_user[0].Token_qr, function (err, url) {
                                  if(err){
                                    console.log(err);
                                    mySqlClient.end();
                                  }
                                  else{
                                mySqlClient.end();
                                res.render('employees/main', {
                                title: 'Editer employé',
                                type: 'edit',
                                description : 'Page de gestion des employés',
                                accessToken : req.session.accessToken,
                                email : req.session.email,
                                autorisation : req.session.autorisation,
                                user_info : info_user[0],
                                certifications : info_certifs,
                                all_certifications : all_certifications,
                                qr_code : url,
                                lien : req.session.lien_web,
                                entreprise : req.session.Nom_entreprise,
                                id_entreprise : req.session.ID_entreprise,
                                contracts : contracts,
                                postes : postes
                              });
                            }
                          });
                        }
                        });
                      }
                    });
                    }
                  });
                }
          });
        }
      });
    }
      sqlCo(req, res, mysql, editEmployee);
    }
    else{
      res.redirect('/');
    }


});

router.get('/employe/:id/:token', function(req, res){

    if(req.params.id && req.params.token){
      function  displayEmployee(req, res, mySqlClient)
      {
        mySqlClient.query("SELECT nom_emp, prenom_emp, Piece_identite, Permis_conduire, Passeport, Duree_visite_medicale, Certificat_medical, Comment_visite_med,  Photo_emp, contrat, DATE_FORMAT(date_embauche, '%d/%m/%Y') AS date_embauche, poste, DATE_FORMAT(visite_med, '%d/%m/%Y') AS visite_med, nom_poste, nom_service, nom_contrat FROM employe INNER JOIN contrats ON contrats.ID_contrat=employe.Contrat INNER JOIN postes ON employe.Poste=postes.ID_poste INNER JOIN services ON services.ID_service=postes.id_service WHERE id_emp='"+req.params.id+"' AND Token_qr='"+req.params.token+"'", function (err, info_user)
        {
          if(err)
          {
            console.log(err);
            mySqlClient.end();
          }
          else
          {
            console.log(info_user);
            var query_certif = "SELECT  liaison_emp_cert.liaison_emp_cert.id_certif, DATE_FORMAT(MaxTime, '%d/%m/%Y') AS MaxTime, niveau, nom_certif, DATEDIFF(MaxTime, now()) AS diff, DATE_FORMAT(liaison_emp_cert.liaison_emp_cert.date_passage,'%d/%m/%Y') AS date_passage, Fichier_certif FROM (SELECT liaison_emp_cert.id_certif, MaxTime, id_emp, date_passage,liaison, CASE	WHEN MaxTime BETWEEN now() AND now() + INTERVAL 120 DAY THEN 'soon'	WHEN MaxTime + INTERVAL Periode_souplesse MONTH < now() THEN 'mort'	WHEN MaxTime > now() + INTERVAL 120 DAY THEN 'valid'	ELSE 'souplesse' END AS niveau 	FROM (SELECT liaison_emp_cert.id_certif, MAX(Date_fin) as MaxTime, id_emp, MAX(date_passage) as date_passage, MAX(ID_liaison) AS liaison FROM liaison_emp_cert WHERE id_emp='"+req.params.id+"' GROUP BY id_certif) liaison_emp_cert INNER JOIN certifications ON certifications.ID_certif=liaison_emp_cert.id_certif) liaison_emp_cert INNER JOIN certifications ON certifications.ID_certif = liaison_emp_cert.id_certif INNER JOIN liaison_emp_cert ON liaison = liaison_emp_cert.ID_liaison ORDER BY Diff DESC";
            mySqlClient.query(query_certif, function (err, info_certifs)
            {
              if(err)
              {
                console.log(err);
                mySqlClient.end();
              }
              else
              {
                qrcode.toDataURL(baseUrl+"/employe/"+req.params.id+"/"+req.params.token, function (err, url) {
                  if(err){
                    console.log(err);
                    mySqlClient.end();
                  }
                  else{
                    console.log(url)
                    info_user[0]["ID_emp"] = req.params.id;
                    createCard(req.params.id, mySqlClient);
                    mySqlClient.end();
                    res.render('employees/main', {
                      title: 'Afficher employé',
                      type: 'display',
                      description : 'Page de gestion des employés',
                      accessToken : req.session.accessToken,
                      email : req.session.email,
                      result: info_user,
                      modifier : req.session.modifier,
                      token : url,
                      lien : req.session.lien_web,
                      entreprise : req.session.Nom_entreprise,
                      id_entreprise : req.session.ID_entreprise,
                      certifcations: info_certifs
                    });
                  }
              });
            }
            });
          }
        });
      }
      sqlCo(req, res, mysql, displayEmployee);
    }

});

function pdfCreation(req,res,mySqlClient){
  var query = "SELECT  DATE_FORMAT(MaxTime, '%d/%m/%Y') AS MaxTime, nom_certif, DATE_FORMAT(liaison_emp_cert.liaison_emp_cert.date_passage,'%d/%m/%Y') AS date_passage, prenom_emp, nom_emp, DATE_FORMAT(visite_med, '%d/%m/%Y') AS visite_med, employe.ID_emp FROM ( SELECT liaison_emp_cert.id_certif, MaxTime, id_emp, date_passage,liaison, CASE WHEN MaxTime BETWEEN now() AND now() + INTERVAL 120 DAY THEN 'soon' WHEN MaxTime + INTERVAL Periode_souplesse MONTH < now() THEN 'mort' WHEN MaxTime > now() + INTERVAL 120 DAY THEN 'valide' ELSE 'souplesse' END AS niveau FROM ( SELECT liaison_emp_cert.id_certif, MAX(Date_fin) as MaxTime, id_emp, MAX(date_passage) as date_passage, MAX(ID_liaison) AS liaison FROM liaison_emp_cert WHERE id_emp='"+req.params.emp_id+"' GROUP BY id_certif) liaison_emp_cert INNER JOIN certifications ON certifications.ID_certif=liaison_emp_cert.id_certif ) liaison_emp_cert INNER JOIN certifications ON certifications.ID_certif = liaison_emp_cert.id_certif INNER JOIN liaison_emp_cert ON liaison = liaison_emp_cert.ID_liaison INNER JOIN employe on employe.ID_emp = liaison_emp_cert.liaison_emp_cert.id_emp WHERE niveau = 'valide' OR niveau = 'soon' ORDER BY nom_certif ASC";
  mySqlClient.query(query, function (err, info_user){
    if(err)
    {
      console.log(err);
      res.send('error');
      mySqlClient.end();
    }
    else
    {
      mySqlClient.end();
      var doc = new PdfDocument({
              autoFirstPage: false
          }),
      table = new PdfTable(doc, {
              bottomMargin: 30
          });
      doc.addPage({
          margins : {
            top: 50,
            bottom: 50,
            left: 72,
            right: 72
          }
      });

      if (fs.existsSync("./public/img/logo/"+req.session.ID_entreprise+".jpg")){
        doc.image("./public/img/logo/"+req.session.ID_entreprise+".jpg", {
          fit: [250, 300],
          align: 'center',
          valign: 'top'
        });
      }


      var infos = {}
      if(info_user.length > 0){
        infos["name"] = info_user[0].nom_emp.toUpperCase()+" "+info_user[0].prenom_emp;
        infos["visite_med"] = info_user[0].visite_med;
      }

      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.text('Nous sousignés '+req.session.Nom_entreprise+', '+req.session.adresse_entreprise+','+req.session.ville_entreprise+', attestons sur l\'honneur que Monsieur '+infos.name+', salarié de notre entreprise est habilité : ' )

      table
          // add some plugins (here, a 'fit-to-width' for a column)
          .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
              column: 'name'
          }))
          // set defaults to your columns
          .setColumnsDefaults({
              headerBorder: 'B',
              align: 'center'
          })
          // add table columns
          .addColumns([
              {
                  id: 'name',
                  header: 'Formation',
                  align: 'left'
              },
              {
                  id: 'obtention',
                  header: 'Date initiale de formation',
                  width: 150
              },
              {
                  id: 'end',
                  header: 'Date de recyclage',
                  width: 150
              }
          ])
          // add events (here, we draw headers on each new page)
          .onPageAdded(function (tb) {
              tb.addHeader();
          });

      // draw content, by passing data to the addBody method
      var table_certif = [];

      for(var j =0; j < info_user.length*2; j= j+2){
          table_certif[j] = {"name" : " ", "obtention" : " ", "end" : " " };
          table_certif[j+1] = {"name" : info_user[Math.ceil(j/2)].nom_certif, "obtention" : info_user[Math.ceil(j/2)].date_passage, "end" : info_user[Math.ceil(j/2)].MaxTime }
      }
      doc.moveDown();
      doc.moveDown();
      table.addBody(table_certif);

      doc.pipe(fs.createWriteStream('./public/pdf/'+req.params.emp_id+'.pdf'));

      doc.moveDown();
      doc.moveDown();
      doc.text('Date de la dernière visite médicale : '+infos.visite_med, 70);

      doc.moveDown();
      doc.text('Cette habilitation est délivrée pour faire ce que droit.', 70);

      doc.moveDown();
      doc.moveDown();
      var date = new Date(Date.now()).toLocaleDateString();
      date = date.split('/');
      console.log(date)
      doc.text('Fait à '+req.session.ville_entreprise+', le '+date[1]+"/"+date[0]+"/"+date[2], {
        align : "left"
      });

      doc.moveDown();
      doc.text(req.session.poste, {
        align : "left"
      });
      doc.text(req.session.nom, {
        align : "left"
      });

      if(req.session.autorisation == 1 && fs.existsSync('./public/img/signatures/'+req.session.email.split('@')[0]+'.jpg')){
        doc.image('./public/img/signatures/'+req.session.email.split('@')[0]+'.jpg', {
          fit: [150, 100],
          align: 'right'
        });
      }
      doc.text('Une société du groupe FAYAT', 20, doc.page.height - 50, {
        lineBreak: false
      });

      doc.end();

      res.send('success');
    }
  });
}

router.post('/upload-sign-file/:emp_id', function(req,res){
  if(req.body.file){
    var path_file = req.params.emp_id;
    if(req.body.photo_file_type == 'img'){
    }
    else{
      var buffer = decodeBase64(req.body.file);
      path_file += ".pdf";
      fs.writeFile("./public/pdf/"+path_file, buffer.data, function(err){
        if(err){console.log(err)}});
      res.send('success')
    }
  }
  else{
    console.log("no file");
    res.end();
  }
})

router.post('/sign/:emp_id', function(req,res){
  if(req.params.emp_id){
    sqlCo(req,res,mysql, pdfCreation);
  }
})

router.post('/deleteEmployee/:id', function(req,res){
  if(req.params.id){
    function deleteEmp(req,res,mySqlClient){
      mySqlClient.query("DELETE FROM employe WHERE ID_emp='"+req.params.id+"'", function (err, result, fields)
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
    sqlCo(req,res,mysql, deleteEmp);
  }
  else{
    res.send('error')
  }
});

router.post('/modifyCertif/:emp_id/:id_certif', function(req,res){
  if(req.params.id_certif){
    console.log(req.body)
    function updateCert(req,res,mySqlClient){
      var query;
      if(req.body.file_type){
        if(req.body.file_type == 'img'){
          var imageBuffer = decodeBase64(req.body.file);
          path_file = req.body.date+"_"+req.params.emp_id+"_"+req.body.certification+".jpg";
          fs.writeFile("./public/img/certifications/"+path_file, imageBuffer.data, function(err){
            if(err){console.log(err)}
          });
        }
        else{
          var buffer = decodeBase64(req.body.file);
          path_file = req.body.date+"_"+req.params.emp_id+"_"+req.body.certification+".pdf";
          fs.writeFile("./public/img/certifications/"+path_file, buffer.data, function(err){
            if(err){console.log(err)}});
        }
        query = "UPDATE liaison_emp_cert SET id_certif ='"+req.body.certification+"', Date_passage='"+req.body.date+"', Date_fin = '"+req.body.expiration_date+"', Fichier_certif = '"+path_file+"'  WHERE ID_liaison='"+req.params.id_certif+"'"
      }else{
        query = "UPDATE liaison_emp_cert SET id_certif ='"+req.body.certification+"', Date_passage='"+req.body.date+"', Date_fin = '"+req.body.expiration_date+"'  WHERE ID_liaison='"+req.params.id_certif+"'"
      }
      mySqlClient.query(query, function (err, info_user){
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else
        {
          console.log('Done')
          pdfCreation(req,res,mySqlClient);
        }
      });
    }
    sqlCo(req, res, mysql, updateCert);
  }
})

router.post('/add-certification/:emp_id', function(req,res){
  if(req.params.emp_id){
    var path_file =null;
    if(req.body.file_type){
      if(req.body.file_type == 'img'){
        var imageBuffer = decodeBase64(req.body.file);
        path_file = req.body.date+"_"+req.params.emp_id+"_"+req.body.certification+".jpg";
        fs.writeFile("./public/img/certifications/"+path_file, imageBuffer.data, function(err){});
      }
      else{
        var buffer = decodeBase64(req.body.file);
        path_file = req.body.date+"_"+req.params.emp_id+"_"+req.body.certification+".pdf";
        fs.writeFile("./public/img/certifications/"+path_file, buffer.data, function(err){});
      }
    }
    function addCertif(req,res,mySqlClient){
      mySqlClient.query("INSERT INTO liaison_emp_cert (id_certif, id_emp, date_passage,date_fin, Fichier_certif) VALUES ('"+req.body.certification+"','"+req.params.emp_id+"','"+req.body.date+"', '"+req.body.expiration_date+"','"+path_file+"')", function (err, result, fields)
      {
        if(err)
        {
          console.log(err);
          mySqlClient.end();
          res.send('error');
        }
        else
        {
          pdfCreation(req,res,mySqlClient);
        }
      });
    }
    sqlCo(req, res, mysql, addCertif);
  }
});

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

function addFile(field, file, req, folder){
  var path_file = req.body.hiring+"_"+req.body.name.replace(/'/g, "\'\'")+"_"+req.body.surname.replace(/'/g, "\'\'");
  if(field == 'img'){
    var imageBuffer = decodeBase64(file);
    path_file += ".jpg";
    fs.writeFile("./public/img/"+folder+"/"+path_file, imageBuffer.data, function(err){
      if(err){
        console.log(err)
      }
    });
  }
  else{
    var buffer = decodeBase64(file);
    path_file += ".pdf";
    fs.writeFile("./public/img/"+folder+"/"+path_file, buffer.data, function(err){
      if(err){console.log(err)}});
  }
  return path_file;
}

router.post('/create', function(req,res){
  console.log('test')
  console.log(req.body["certifications-infos"]);
  if(req.body.name && req.body.surname && req.body.hiring && req.body["medical-visit"] && req.body.post && req.body.contract){
    function createEmp(req,res,mySqlClient){
      var query = "",
      token = uuidv1(),
      create="INSERT INTO employe (Nom_emp,Prenom_emp,Contrat,Date_embauche,Poste,Token_qr,Visite_med, id_entreprise, Duree_visite_medicale, Comment_visite_med",
      values ="VALUES ('"+req.body.name.trim().replace(/'/g, "\'\'")+"','"+req.body.surname.trim().replace(/'/g, "\'\'")+"','"+req.body.contract+"','"+req.body.hiring+"','"+req.body.post+"','"+token+"','"+req.body["medical-visit"]+"','"+req.session.ID_entreprise+"','"+req.body.medical_length+"','"+req.body.medical_comment+"'";

      if(req.body.photo_file_type){
        create += ",Photo_emp";
        values += ", '"+addFile(req.body.photo_file_type,req.body.photo_file, req, "photo")+"'"
      }
      if(req.body.pi_file_type){
        create += ",Piece_identite";
        values += ", '"+addFile(req.body.pi_file_type,req.body.pi_file,  req, "piece_identite")+"'"
      }
      if(req.body.pc_file_type){
        create += ",Permis_conduire";
        values += ", '"+addFile(req.body.pc_file_type,req.body.pc_file, req, "permis_conduite")+"'"
      }
      if(req.body.vm_file_type){
        create += ",Certificat_medical";
        values += ", '"+addFile(req.body.vm_file_type,req.body.vm_file, req, "visite_medicale")+"'"
      }
      if(req.body.passeport_file_type){
        create += ",Passeport";
        values += ", '"+addFile(req.body.passeport_file_type,req.body.passeport_file, req, "passeport")+"'"
      }
      query = create+") "+values+")";
      console.log(query);
      mySqlClient.query(query, function (err, info_user){
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else
        {
          console.log('Done')
          mySqlClient.end();
          res.send('success');
        }
      });
    }
    sqlCo(req, res, mysql, createEmp);
  }
});

router.post('/modify/:emp_id', function(req,res){
  if(req.params.emp_id){
    function updateEmp(req,res,mySqlClient){
      var query = "UPDATE employe SET Nom_emp = '"+req.body.name.trim().replace(/'/g, "\'\'")+"',Prenom_emp='"+req.body.surname.trim().replace(/'/g, "\'\'")+"', contrat='"+req.body.contract+"', date_embauche='"+req.body.hiring+"',poste='"+req.body.post+"',visite_med='"+req.body["medical-visit"]+"', Duree_visite_medicale='"+req.body.medical_length+"', Comment_visite_med='"+req.body.medical_comment+"'"
      if(req.body.photo_file_type){
        query += ",Photo_emp ='"+addFile(req.body.photo_file_type,req.body.photo_file, req, "photo")+"'";
      }
      if(req.body.pi_file_type){
        query += ",Piece_identite ='"+addFile(req.body.pi_file_type,req.body.pi_file, req, "piece_identite")+"'";
      }
      if(req.body.pc_file_type){
        query += ",Permis_conduire ='"+addFile(req.body.pc_file_type,req.body.pc_file, req, "permis_conduite")+"'";
      }
      if(req.body.vm_file_type){
        query += ",Certificat_medical ='"+addFile(req.body.vm_file_type,req.body.vm_file, req, "visite_medicale")+"'";
      }
      if(req.body.passeport_file_type){
        query += ",Passeport ='"+addFile(req.body.passeport_file_type,req.body.passeport_file, req, "passeport")+"'";
      }
      query += " WHERE ID_emp='"+req.params.emp_id+"'";

      console.log(query);
      mySqlClient.query(query, function (err, info_user){
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else
        {
          console.log('Done')
          mySqlClient.end();
          res.send('success');
        }
      });
    }
    sqlCo(req, res, mysql, updateEmp);
  }
})

router.post('/resetQR/:emp_id', function(req,res){
  if(req.params.emp_id){
    function resetQR(req,res,mySqlClient){
      var new_token = uuidv1();
      mySqlClient.query("SELECT COUNT(Token_qr) AS token FROM employe WHERE Token_qr='"+new_token+"'",function(err, count){
        if(err){
          console.log(err);
          mySqlClient.end();
          res.send('error');
        }
        else{
          if(count[0].token == 0){
            mySqlClient.query("UPDATE employe SET Token_qr = '"+new_token+"' WHERE ID_emp='"+req.params.emp_id+"'",function(err,result){
              if(err){
                console.log(err);
                mySqlClient.end();
                res.send('error');
              }
              else{
                res.send('success');
                mySqlClient.end();
              }
            })
          }
        }
      })
    }
    sqlCo(req, res, mysql, resetQR);
  }
})

router.post('/activate/:emp_id/:check', function(req,res){
  if(req.params.emp_id && req.params.check){
    function changeState(req,res, mySqlClient){
      var query = "UPDATE employe SET actif = '"+req.params.check+"' WHERE ID_emp = '"+req.params.emp_id+"'"
      console.log(query);
      mySqlClient.query(query, function (err, info_user){
        if(err)
        {
          console.log(err);
          mySqlClient.end();
        }
        else
        {
          console.log('Done')
          mySqlClient.end();
          res.send('success');
        }
      });
    }
    sqlCo(req,res,mysql, changeState)
  }

})

module.exports = router;
