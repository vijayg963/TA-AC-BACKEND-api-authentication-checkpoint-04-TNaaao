var express = require('express');
var router = express.Router();
var Question = require('../models/Questions');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/tags', async (req, res) => {
  try {
    let tags = await Question.find({}).distinct('tags');
    res.status(200).json({ tags: tags });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
