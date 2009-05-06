Task = Ext.data.Record.create([
    {name: 'id', type:'int'},
    {name: 'user_id', type:'int'},
    {name: 'title', type:'string'},
    {name: 'context', type:'string'},
    {name: 'description', type:'string'},
    {name: 'project', type:'string'},
    {name: 'project_pos', type:'int'},
    {name: 'context_pos', type:'int'},
    {name: 'due_date', type:'date', dateFormat: 'Y-m-d H:i:s'},
    {name: 'complete_date', type:'date', dateFormat: 'Y-m-d H:i:s'},

    {name: 'created_at', type:'date'}, 
    {name: 'updated_at', type:'date'},
    {name: 'active', type:'int'},
    {name: 'version', type:'int'},
    {name: 'id_start', type:'int'},
    {name: 'id_start_db', type:'string'},
    {name: 'synced_at', type:'date'}
]);

Task.nextId = function(){
    var id = Math.floor((new Date(1970,1,1).getTime() - new Date().getTime())/1000)
    return - Math.abs(id);
}

// The main grid's store
TaskStore = function(conn){
    TaskStore.superclass.constructor.call(this, {
        sortInfo:{field: 'project_pos', direction: "ASC"},
        groupField:'project',
        taskFilter: 'all',
        reader: new Ext.data.JsonReader({
            id: 'id'
        }, Task)
    });
    //this.data = new LinkedList();
    this.recordChangeObserver = null;
    // stores 
    this.changeStore = new TaskChangeStore(conn);
    this.metadataStore = new MetadataStore(conn);
    
    this.proxy = new Ext.data.SqlDB.Proxy(conn, 'actions', 'id', this);

    if(window.google){ // google needs the table created
        this.proxy.on('beforeload', this.prepareTable, conn);
        this.proxy.on('beforeload', this.changeStore.prepareTable, conn);
    }
    this.proxy.on('recordupdated', this.recordChange, this);


    this.addEvents({newcontext: true});
    this.addEvents({newproject: true});
};


Ext.extend(TaskStore, Ext.data.GroupingStore, {
    applyFilter : function(filter){
        if(filter !== undefined){
            this.taskFilter = filter;
        }
        var value = this.taskFilter;
        return this.filterBy(function(item){
            if (value) {
                return item.data.complete_date !== '';
            }else{
                return item.data.complete_date === '';
            }
        });
    },

//    applySort : function() {
//
//      // znajdz max key
//      // daj na koniec
//      // i po kolei przenos project_pos na koniec
//      var data = this.data;
//      
//      for(var k=0; k<10; k++) {
//	      data.each(function(record) {
//	        var prevIndex = data.indexOf(record);
//	        var index = data.indexOfKey(record.get('project_pos'));
//	        if (!index) {
//	        	index = 0;
//	        }
//	        if (index > prevIndex) {
//	          record = data.remove(record);
//	          data.insert(index, record.get('id'), record);
//	        }
//	      });
//      }
//      this.fireEvent("datachanged", this);
//    },

    addTask : function(data){
    	data.id_start = data.id
        data.id_start_db = this.metadataStore.getIdent();

        // sets conventional parameters
        data.created_at = data.updated_at = new Date();

        if (data.active == null)
        	data.active = 1;
        if (data.version == null)
        	data.version = 0;
        	
    	this.suspendEvents();
        this.clearFilter();
        this.resumeEvents();
        this.loadData([data], true);
        this.suspendEvents();
        this.applyFilter();
        this.applyGrouping(true);
        this.resumeEvents();
        this.fireEvent('datachanged', this);
        this.fireEvent('newcontext', data.context);
        this.fireEvent('newproject', data.project);
    },

    prepareTable : function(){
        try{
        this.createTable({
            name: 'actions',
            key: 'id',
            fields: Task.prototype.fields
        });
        }catch(e){console.log(e)}
    },
    
    setRecordChangeObserver : function(observer){
        this.recordChangeObserver = observer;
    },
    
    recordChange : function(obj, record){
        // save record change
        if (record.skipStoringChanges == true) {
            delete record.skipStoringChanges;    
        } else {
            this.changeStore.recordChange(record.get('id'));
            if (this.recordChangeObserver != null) {
                this.recordChangeObserver(record);
            }
        }
    },
    
    reloadRecords : function(recordsId, dbIdent){
        if (recordsId && recordsId.length > 0) {
          // refactor me to where builder
          var where = 'where '
          for(var i=0; i<recordsId.length; i++) {
              where += 'id=? OR '
          }
          where += '1=2'
          this.proxy.load({ where : where, args : recordsId}, this.reader, this.myLoadRecords, this, {dbIdent : dbIdent});
        }
    },
    
    myLoadRecords : function(o, options, success){
        var r = o.records, t = o.totalRecords || r.length;
        this.totalLength = Math.max(t, this.data.length+r.length);
        for(var i=0;i<r.length;i++) {
            var changed = r[i];
            changed.skipStoringChanges = true;
            
            // missing - ids
            if (changed.get('active') == 1) {
                this.suspendEvents();
                this.add([changed]);
                this.resumeEvents();
            } else { // not active remove if exist
                var current = this.getById(changed.get('id'));
                if (current != null) {
                    this.remove(current);
                }
            }
            // if its orginated record try to remove it's parent
            if (changed.get('id_start_db') == options.dbIdent) {
                var origin = this.getById(changed.get('id_start'));
                if (origin != null){
                  origin.skipStoringChanges = true;
                  this.remove(origin);  
                }
            }
        }
        this.applySort();
        this.applyFilter();
        this.fireEvent("datachanged", this);
    }
    
});
