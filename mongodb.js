var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connect: function(callback){
    MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/", function(err, database) {
      if(err) throw err;
      if(process.env.MONGODB_URI)
        _db = database
      else 
        _db = database.db('datadotnewamerica');

      callback(_db);
    });
  },
  db: function(){
    return _db;
  }
}
