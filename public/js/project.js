// The store for Projects
ProjectStore = function(){
    ProjectStore.superclass.constructor.call(this, {
        expandData: true,
        data: [],
        fields:[{name: 'text', type:'string'}],
        sortInfo:{field:'text', direction:'ASC'},
        id: 0
    });
}

Ext.extend(ProjectStore, Ext.data.SimpleStore, {
    init : function(store){
        var projs = store.collect('project', false, true);
        this.loadData(projs);
    },

    addProject : function(proj){
        if(proj && this.indexOfId(proj) === -1){
            this.clearFilter(true);
            this.loadData([proj], true);
            this.applySort();
        }
    }
});
