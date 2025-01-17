var mysql = require('mysql');

//@Dependency("DatabaseConnection")
function DatabaseConnection() {

  var _this = this;
  var dbConfig; // db configurations
  var connection; // This is used as a singleton in a single connection strategy
  var pool; // Pool singleton
  var strategy; // Pool singleton

  this.main = function() {
  }

  this.initializeConnection = function(dbConfig, strategy) {

    if (null == dbConfig) throw new Error('Missing dbConfig module param!');
    if (null == strategy) strategy = 'single';

    _this.strategy = strategy;

    // Setting _this.dbConfig ref
    _this.dbConfig = dbConfig;

    // Configuring strategies
    switch (strategy) {
      case 'single':
        // Creating single connection instance
        _this.connection = mysql.createConnection(dbConfig);
        handleDisconnect(dbConfig);
        break;
      case 'pool':
        // Creating pool instance
        _this.pool = mysql.createPool(dbConfig);
        console.log("mysql connections pool status: " + ((_this.pool) ? "success" : "failure"));
        break;
      default:
        throw new Error('Not supported connection strategy!');
    }
  }

  this.getConnection = function(callback) {
    switch (_this.strategy) {
      case 'single':
        // getConnection will return singleton connection
        callback(null, _this.connection);
        break;
      //@TODO : in the tird invocation, app frezze
      case 'pool':
        // getConnection handled by mysql pool
        _this.pool.getConnection(function(err, connection) {
          if (err) callback(err);
          callback(null, connection);
        });
        break;
    }
  }

  /**
   * Handling connection disconnects, as defined here: https://github.com/felixge/node-mysql
   */
  function handleDisconnect() {
    _this.connection = mysql.createConnection(_this.dbConfig);

    _this.connection.connect(function(err) {
      if (err) {
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000);
      }
    });

    _this.connection.on('error', function(err) {
      console.log('db error', err);
      if (err.code === 'PROTOCOL_this.CONNECTION_this.LOST') {
        handleDisconnect();
      } else {
        throw err;
      }
    });
  }

}


module.exports = DatabaseConnection;
