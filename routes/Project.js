var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var ProjectRouter = express.Router();
var mongoUtils = require('../mongodb');
var nest = require('d3').nest;

var db = mongoUtils.db();

ProjectRouter.route('/').get(function(req, res){
  var fields = { title: true, department: true, metaData: true };
  db.collection('projects').find({}, { fields }).toArray(function(err, data){
    if(err) return res.send(err);
    res.json(data);
  });
});

ProjectRouter.route('/:id').get(function(req, res){
  var qry = { _id: ObjectID(req.params.id) };
  var fields = { title: true, department: true, metaData: true };
  db.collection('projects').findOne(qry, { fields }, function(err,data){
    if(err) return res.send(err);
    res.json(data);
  });
});

ProjectRouter.route('/:id/data').get(function (req, res) {
  var id = req.params.id;
  var qry = [ { $match: { _id: ObjectID(id) } } ];
  var conditions = [];

  for(var k in req.query){
    if(['group_by', 'metadata'].indexOf(k) > -1) continue;
    var val = toNum(req.query[k]);
    var cond = parseCond(k, val);
    if(!cond) continue;
    conditions.push(cond);
  }

  var $filter = {
    input: "$data",
    as: "datum",
    cond: { $and: conditions }
  };

  var $project = { data: { $filter }};
  if(req.query.metadata==='true') $project.metaData = 1;

  qry.push({ $project });

  db.collection('projects').aggregate(qry).toArray(function(err, data){
    if(err) return res.send(err);
    if(!data) return res.send({ message: `No project found with id: ${id}`})
    if(data.length===0) return res.send({ message: `No project found with id: ${id}`})
    if(req.query.group_by)
      data[0].data = groupData(data[0].data, req.query.group_by);

    res.json(data[0]);
  })
});


function groupData(data, groups){
  var grouped = nest();
  groups.forEach(function(k){
    grouped.key(function(d){ return d[k]; })
  });

  return grouped.object(data);
}

function parseCond(k,val){
  var pieces = k.split('__');
  var key = pieces[0];
  var filter = pieces[1] || 'eq';

  if(['lt', 'lte', 'gt', 'gte', 'in', 'eq'].indexOf(filter) === -1) return null;

  return {[`$${filter}`]: [`$$datum.${key}`, val]};
}

function toNum(n){
  if(n instanceof Array)
    return arrayToNum(n);

  return isNaN(n) ? n : +n;
}

function arrayToNum(arr, acc=[]){
  if(acc.length==arr.length) return acc;
  var v = arr[acc.length];
  var n = isNaN(v) ? v : +v;
  return arrayToNum(arr, [...acc, n]);
}


module.exports = ProjectRouter;
