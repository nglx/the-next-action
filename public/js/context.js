// The store for Categories
ContextStore = function(){
    ContextStore.superclass.constructor.call(this, {
        expandData: true,
        data: [],
        fields:[{name: 'text', type:'string'}],
        sortInfo:{field:'text', direction:'ASC'},
        id: 0
    });
}

Ext.extend(ContextStore, Ext.data.SimpleStore, {
    init : function(store){
        var cats = store.collect('context', false, true);
        this.loadData(cats);
    },

    addContext : function(cat){
        if(cat && this.indexOfId(cat) === -1){
            this.clearFilter(true);
            this.loadData([cat], true);
            this.applySort();
        }
    }
});
