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
}//    // run migration if needed
//    conn.query("select count(*) as ilosc from sqlite_master where name='task'", function(rs) {
//        var exists = (rs[0]['ilosc'] == 1);
//        if (exists) {
//            statusBar.showBusy("Migrating tasks...");
//            migrateWorkerId = workerPool.createWorkerFromUrl('js/migrate-worker.js');
//            workerPool.sendMessage([metadataStore.getIdent()], migrateWorkerId);
//        }
//    });


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
      }//    // run migration if needed
//    conn.query("select count(*) as ilosc from sqlite_master where name='task'", function(rs) {
//        var exists = (rs[0]['ilosc'] == 1);
//        if (exists) {
//            statusBar.showBusy("Migrating tasks...");
//            migrateWorkerId = workerPool.createWorkerFromUrl('js/migrate-worker.js');
//            workerPool.sendMessage([metadataStore.getIdent()], migrateWorkerId);
//        }
//    });
      
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


var db = new GearsDB('gtd-actions.db');
//    // run migration if needed
//    conn.query("select count(*) as ilosc from sqlite_master where name='task'", function(rs) {
//        var exists = (rs[0]['ilosc'] == 1);
//        if (exists) {
//            statusBar.showBusy("Migrating tasks...");
//            migrateWorkerId = workerPool.createWorkerFromUrl('js/migrate-worker.js');
//            workerPool.sendMessage([metadataStore.getIdent()], migrateWorkerId);
//        }
//    });

google.gears.workerPool.onmessage = function(messageText, senderId, message) {
    var dbIdent = message.body[0];
    var base = 0;
    db.selectAll('select * from task', null, function(task) {
        var id = Math.floor((new Date(1970,1,1).getTime() - new Date().getTime())/1000)
        id = - Math.abs(id) - base;
        db.insertRow('actions', {
            id: id,
            user_id: '',
            title: task.title,
            context: task.context,
            description: task.description,
            project: task.project,
            project_pos: task.projectPos,
            context_pos: task.contextPos,
            due_date: task.dueDate,
            complete_date: task.completeDate,
            active: 1,
            version: 0,
            id_start: id,
            id_start_db: dbIdent
        });
        db.insertRow('changes_actions', {id: id, op: 's'});
        base++;
    });
    db.run('alter table task rename to task_obsolete')   
    google.gears.workerPool.sendMessage(["done"], senderId);
}
