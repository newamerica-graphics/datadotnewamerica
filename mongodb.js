var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connect: function(callback){
    MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/", function(err, database) {
      if(err) throw err;

      _db = database.db(process.env.DB || 'datadotnewamerica');

      callback(_db);
    });
  },
  db: function(){
    return _db;
  }
}
