Metadata = Ext.data.Record.create([
    {name: 'key', type:'string'},
    {name: 'value', type:'string'}
]);

MetadataStore = function(conn){
    MetadataStore.superclass.constructor.call(this, {
        reader: new Ext.data.JsonReader({
            id: 'key'
        }, Metadata)
    });
    this.dbIdent;
 	this.proxy = new Ext.data.SqlDB.Proxy(conn, 'metadata', 'key', this);

    if(window.google){ // google needs the table created
        this.proxy.on('beforeload', this.prepareTable, conn);
    }
}

Ext.extend(MetadataStore, Ext.data.Store, {
	prepareTable : function(){
    try{
    this.createTable({
        name: 'metadata',
        key: 'key',
        fields: Metadata.prototype.fields
    });
    }catch(e){console.log(e)}
	},

    getIdent : function() {
		if (this.dbIdent == null) {
			// try to read it from db
			var dbIdent = this.readValue('db_ident');
			if (dbIdent == null) {
		 	    console.log("Generating db ident");
				dbIdent = (new Date().getTime() - new Date('2007/06/10').getTime()) + '-' + Math.floor(Math.random() * 100000);
				this.storeValue('db_ident', dbIdent); 
			}
			// cache
			this.dbIdent = dbIdent;
		}
 	    console.log("Db ident is: " + this.dbIdent);
 	    return this.dbIdent;
	},
	
	getSyncAt : function() {
		return this.readValue('sync_at');
	},
	setSyncAt : function(value) {
		var record = this.getById('sync_at'); 
		if (record == null) {
			this.storeValue('sync_at', value);
		} else {
			record.set('value', value)
		}
	},
    getLoggedId : function() {
        return this.readValue('logged_id');
    },
    setLoggedId : function(value) {
        var record = this.getById('logged_id'); 
        if (record == null) {
            this.storeValue('logged_id', value);
        } else {
            record.set('value', value)
        }
    },
	readValue : function(key) {
		// fixme move loading to initialization
		this.load();
		var record = this.getById(key);
		return (record == null) ? null : record.get('value');
	},
	storeValue : function(key, value) {
		this.loadData([{key: key, value: value}], true);
		this.fireEvent('datachanged', this);
	}
});
