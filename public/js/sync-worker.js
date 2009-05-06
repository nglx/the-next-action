function Console() {
    var logS = '';
    this.log = function(log) {
//      logS += log
    }
    
    this.readLog = function() {
      var toR = ''+logS;
      logS = '';
      return toR;
    }
}
var console = new Console();

// -- GearsDB itself!

function GearsDB(name) {
  this.db = this.getDB(name);
}

GearsDB.prototype.getDB = function(name) {
  console.log("DB Name: " + name);
  try {
    var db = google.gears.factory.create('beta.database', '1.0');
    db.open(name);
    return db;
  } catch (e) {
    console.log('Could not get a handle to the database [' + name + ']: '+ e.message);
  }
}

// -- SELECT

GearsDB.prototype.selectAll = function(sql, args, callback) {
  var rs = this.run(sql, args);
  if (!callback) {
    var total = [];
    callback = function(o) {
      total.push(o);
    }
    this.resultSetToObjects(rs, callback);
    return total;
  } else {
    return this.resultSetToObjects(rs, callback);
  }
}

GearsDB.prototype.selectOne = function(sql, args) {
  var rs = this.run(sql, args);
  return this.resultSetToObject(rs);  
}

GearsDB.prototype.selectRow = function(table, where, args, select) {
  return this.selectOne(this.selectSql(table, where, select), args);
}

GearsDB.prototype.selectRows = function(table, where, args, callback, select) {
  return this.selectAll(this.selectSql(table, where, select), args, callback);
}

GearsDB.prototype.run = function(sql, args) {
  try {
    var argvalue = '';
    if (args) argvalue = " with args: " + args.join(', ');
    console.log("SQL: " + sql + argvalue);
   
    return this.db.execute(sql, args);
  } catch (e) {
    var argvalue = '';
    if (args) argvalue = " with args: " + args.join(', ');
    console.log("Trying to run: " + sql + argvalue + " producing error: " + e.message);
  }
}

GearsDB.prototype.insertRow = function(table, o, condition, conditionArgs) {
  if (condition) {
    var exists = this.selectOne('select rowid from ' + table + ' where ' + condition, conditionArgs);
    if (exists) {
      var argvalue = '';
      if (conditionArgs) argvalue = " with args: " + conditionArgs.join(', ');
      console.log("Row already exists for '" + condition + "' " + argvalue);
      return; // cut and run!
    }
  }
  var keys = [];
  var values = [];
  for (var x in o) {
    if (o.hasOwnProperty(x)) {
      keys.push(x);
      values.push(o[x]);
    }
  }

  this.run(this.insertSql(table, keys), values);
}

GearsDB.prototype.deleteRow = function(table, o) {
  var keys = [];
  var values = [];
  for (var x in o) {
    if (o.hasOwnProperty(x)) {
      keys.push(x);
      values.push(o[x]);
    }
  }

  this.run(this.deleteSql(table, keys), values);
}

GearsDB.prototype.updateRow = function(table, o, theId) {
  if (!theId) theId = 'id';
  var keys = [];
  var values = [];
  for (var x in o) {
    if (o.hasOwnProperty(x)) {
      keys.push(x);
      values.push(o[x]);
    }
  }
  values.push(o[theId]); // add on the id piece to the end

  this.run(this.updateSql(table, keys, theId), values);
}

GearsDB.prototype.forceRow = function(table, o, theId) {
  if (!theId) theId = 'id';
 
  var exists = this.selectRow(table, theId + ' = ?', [ o[theId] ], 'rowid');
 
  if (exists) {
    this.updateRow(table, o, theId);
  } else {
    this.insertRow(table, o);
  }  
}

GearsDB.prototype.dropTable = function(table) {
  this.run('delete from ' + table);
  this.run('drop table ' + table);
}

// -- Helpers

GearsDB.prototype.getColumns = function(rs) {
  var cols = rs.fieldCount();
  var colNames = [];
  for (var i = 0; i < cols; i++) {
    colNames.push(rs.fieldName(i));      
  }
  return colNames;
}


GearsDB.prototype.resultSetToObjects = function(rs, callback) {
  try {
    if (rs && rs.isValidRow()) {
      var columns = this.getColumns(rs);

      while (rs.isValidRow()) {
        var h = {};
        for (i = 0; i < columns.length; i++) {
          h[columns[i]] = rs.field(i);
        }
        callback(h);
        rs.next();
      }
    }
  } catch (e) {
    console.log(e.message);
  } finally {
    rs.close();
  }
}

GearsDB.prototype.resultSetToObject = function(rs) {
  try {
    if (rs && rs.isValidRow()) {
      var columns = this.getColumns(rs);

      var h = {};
      for (i = 0; i < columns.length; i++) {
        h[columns[i]] = rs.field(i);
      }
      return h;
    }
  } catch (e) {
    console.log(e);
  } finally {
    rs.close();
  }  
}

// -- SQL creators

GearsDB.prototype.selectSql = function(table, where, select) {
  if (!select) select = '*';
  return 'select ' + select + ' from ' + table + ' where ' + where;
}

GearsDB.prototype.insertSql = function(table, keys) {
  var placeholders = [];
  for (var i = 0; i < keys.length; i++) {
    placeholders.push('?');
  }
  return 'insert into ' + table + ' (' + keys.join(',') + ')' + " VALUES (" + placeholders.join(',') + ")";
}

GearsDB.prototype.deleteSql = function(table, keys) {
  var where = [];
  for (var i = 0; i < keys.length; i++) {
    where.push(keys[i] + '=?');
  }
  return 'delete from ' + table + ' where ' + where.join(' and ');
}

GearsDB.prototype.updateSql = function(table, keys, theId) {
  if (!theId) theId = 'id';
  var set = [];
  for (var i = 0; i < keys.length; i++) {
    set.push(keys[i] + '=?');
  }
  return 'update ' + table + ' set ' + set.join(', ') + ' where ' + theId + '= ?';
}

toJsonString = function(arg) {
    return toJsonStringArray(arg).join('');
}

toJsonStringArray = function(arg, out) {
    out = out || new Array();
    var u; // undefined

    switch (typeof arg) {
    case 'object':
        if (arg) {
            if (arg.constructor == Array) {
                out.push('[');
                for (var i = 0; i < arg.length; ++i) {
                    if (i > 0/* && out[out.size-1] != undefined*/)
                        out.push(',\n');
                    toJsonStringArray(arg[i], out);
                }
                out.push(']');
                return out;
            } else if (typeof arg.toString != 'undefined') {
                out.push('{');
                var first = true;
                for (var i in arg) {
                    var curr = out.length; // Record position to allow undo when arg[i] is undefined.
                    if (!first)
                        out.push(',\n');
                    toJsonStringArray(i, out);
                    out.push(':');                    
                    toJsonStringArray(arg[i], out);
                    if (out[out.length - 1] == u)
                        out.splice(curr, out.length - curr);
                    else
                        first = false;
                }
                out.push('}');
                return out;
            }
            return out;
        }
        out.push('null');
        return out;
    case 'unknown':
    case 'undefined':
    case 'function':
        out.push(u);
        return out;
    case 'string':
        out.push('"')
        out.push(arg.replace(/(["\\])/g, '\\$1').replace(/\r/g, '').replace(/\n/g, '\\n'));
        out.push('"');
        return out;
    default:
        out.push(String(arg));
        return out;
    }
}

function readChanged(userId) {
    var out = new Array();
    var i = 0;
    
    gearsDb.selectAll('select * from changes_actions', null, function(changes) {
      // find action only for current user or empty user
      action = gearsDb.selectOne("select * from actions where id=? and (user_id=? or user_id='')", [changes.id, userId]);
      if (action)
        out[i++] = action;
    });
    return out; 
}

function synchronizeRequest(senderId, message) {
    google.gears.workerPool.sendMessage(['start'], senderId);
    // sync_at, db_ident would be passed
    var dbIdent = message.body[0];
    var userId  = message.body[1];
    
    var syncAt  = gearsDb.selectOne("select sync_at from sync_at where user_id=?",[userId]);
    if (syncAt != null) { syncAt = syncAt.sync_at; }
    // do not check if we are online and logged - this would be done externally

    request.open('POST', '/actions/sync');
    request.setRequestHeader("Content-type","application/x-www-form-urlencoded");

    request.onreadystatechange = function() {
      if (request.readyState == 4) {
          eval('var out = '+request.responseText);
          var actions = out.data;
          var actionIds = new Array();
          for (var i=0; i<actions.length; i++) {
            var action = actions[i];
            gearsDb.forceRow('actions', action);
    
            if (/* action.id > 0 && */
                action.id_start_db == dbIdent &&
                action.version == 1) {
    
                gearsDb.deleteRow('changes_actions', {id: action.id_start})
                gearsDb.deleteRow('actions', {id: action.id_start});
            } else {
                gearsDb.deleteRow('changes_actions', {id: action.id})
            }
            if (action.active == 0) {
                // remove it from local cause its synchronized
                gearsDb.deleteRow('actions', {id: action.id})
            }
            actionIds[i] = action.id;
          }
          // store out.sync_at
          gearsDb.forceRow('sync_at', {user_id: userId, sync_at: ''+out.sync_at}, 'user_id');
          google.gears.workerPool.sendMessage(['finish', out.success, actionIds, syncAt], senderId);
      }
    };
    
    request.send("db_ident="+dbIdent+"&sync_at="+syncAt+"&data="+toJsonString(readChanged(userId)));
}

// buffer the messages for one second (skipping previous)
var IDLE_TIME = 3000;
var gearsDb = new GearsDB('gtd-actions.db');
var request = google.gears.factory.create('beta.httprequest');
var timer = google.gears.factory.create('beta.timer');

var messageCount = 0;

// create sync at table if missing
gearsDb.run("CREATE TABLE IF NOT EXISTS sync_at(user_id INTEGER PRIMARY KEY, sync_at TEXT)");

google.gears.workerPool.onmessage = function(messageText, senderId, message) {
	messageCount++;
	var currentMessageCount = messageCount;
	
    timer.setTimeout(function() { 
        if (currentMessageCount == messageCount) {
            synchronizeRequest(senderId, message);
        }
	}, IDLE_TIME);
};
