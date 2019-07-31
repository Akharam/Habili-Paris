var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/general', function(req, res) {
  res.render('general', { title: 'Express' });
});

module.exports = router;
