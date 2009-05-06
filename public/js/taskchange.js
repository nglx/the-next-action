TaskChange = Ext.data.Record.create([
    {name: 'id', type:'int'},
    {name: 'op', type:'string'}
]);

TaskChangeStore = function(conn){
    TaskStore.superclass.constructor.call(this, {
        reader: new Ext.data.JsonReader({
            id: 'id'
        }, TaskChange)
    });

	this.proxy = new Ext.data.SqlDB.Proxy(conn, 'changes_actions', 'id', this);
}

Ext.extend(TaskChangeStore, Ext.data.Store, {
    prepareTable : function(){
    try{
    this.createTable({
        name: 'changes_actions',
        key: 'id',
        fields: TaskChange.prototype.fields
    });
    }catch(e){console.log(e)}
	},
	
	recordChange : function(id) {
        this.loadData([{id: id, op: 's'}], true);
        // executeSql('INSERT OR REPLACE INTO changes_' + tableName + ' (id, op) VALUES (?, ?)', [ id, op ]);
	}
});
