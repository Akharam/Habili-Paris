var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/accueil', function(req, res) {
  res.render('home/main', {
    title: 'Accueil',
    description : 'Première page' });
});

module.exports = router;
