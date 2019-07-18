var express = require('express');
var router = express.Router();
var conf = require('../config');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var util = require('../util');

/* GET rules listing. */
router.get('/:type', all);

/* GET rules by ID. */
router.get('/:id', dataById);

// Add new rules
router.post('/add', add);

// Update rules
router.post('/update', update);

// Remove rules
router.get('/remove/:id', remove);

// Login
router.post('/login', login);

function all(req, res, next) {
  var filter = {};
  if (req.params.type === 'active') {
    filter['active'] = true;
  }
  MongoClient.connect(conf.database, (err, db) => {
    if (err) throw err;
    db.collection('rules').find(filter).toArray((err, rules) => {
      db.close();
      if (err) next(err);
      res.json(util.success(rules, 'All Rules.'));
    });
  });
}

function dataById(req, res, next) {
  MongoClient.connect(conf.database, (err, db) => {
    if (err) throw err;
    db.collection('rules').findOne({
      '_id': mongo.ObjectId(req.params.id)
    }).then((rule) => {
      db.close();
      if (rule) {
        return res.json(util.success(rule, 'Rule details ID'));
      } else {
        return res.json(util.failure('Rule Not Found '));
      }
    }, (err) => next(err));
  });
}

function add(req, res, next) {
  MongoClient.connect(conf.database, (err, db) => {
    if (err) throw err;
    req.body.active = false;
    req.body.createdAt = Date.now();
    db.collection('rules').insert(req.body, (err, result) => {
      db.close();
      if (err) next(err);
      res.json(util.success(result, 'Rule added.'));
    });
  });
}

function update(req, res, next) {
  MongoClient.connect(conf.database, (err, db) => {
    if (err) throw err;
    if (req.body._id) {
      req.body.updatedAt = Date.now();
      req.body._id = mongo.ObjectId(req.body._id)
      db.collection('rules').findOneAndUpdate({
        '_id': req.body._id
      }, {
        '$set': req.body
      }, {
        returnOriginal: false
      }, (err, result) => {
        db.close();
        if (err) next(err);
        res.json(util.success(result, 'Rule updated.'));
      });
    } else {
      return res.json(util.failure('Rule Not Found '));
    }
  });
}

function remove(req, res, next) {
  MongoClient.connect(conf.database, (err, db) => {
    if (err) throw err;
    db.collection('rules').deleteOne({
      '_id': mongo.ObjectId(req.params.id)
    }).then((result) => {
      db.close();
      res.json(util.success(result, 'Rule removed.'));
    }, (err) => next(err));
  });
}

function login(req, res, next) {
  if (req.body.username && req.body.password) {
    if (req.body.username === 'admin' && req.body.password === '2019@amz') {
      var user = {};
      user['isAdmin'] = true;
      user['name'] = 'admin';
      res.json(util.success(user, 'Login successful.'));
    } else {
      res.json(util.failure('Username and password not matched'));
    }
  } else {
    res.json(util.failure('Login failed.'));
  }
}

module.exports = router;