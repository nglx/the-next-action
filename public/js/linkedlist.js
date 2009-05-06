LinkedList = function(allowFunctions, keyFn){
    this.items = [];
    this.previous_project = [];
    this.previous_context = [];
    
    this.head_project = null;
    this.head_context = null;
    //this.map = {};
    //this.keys = [];
    //this.length = 0;
    this.addEvents(
        "clear",
        "add",
        "replace",
        "remove",
        "sort"
    );
    //this.allowFunctions = allowFunctions === true;
//    if(keyFn){
//        this.getKey = keyFn;
//    }
    this.data = new Ext.util.MixedCollection(false);
};

Ext.extend(LinkedList, Ext.util.Observable, {
    clear : function() {
        this.data.clear();
    },
    
    addAll : function(objs){
        for(var i = 0, len = objs.length; i < len; i++){
            this.previous_project[objs[i].get('project_pos')] = objs[i];
            this.previous_context[objs[i].get('context_pos')] = objs[i];
            if (this.previous_project.length > 0) {
	            var loop = objs[i].get('project_pos') == this.previous_project[objs[i].get('project_pos')].get('project_pos');
	            if (loop) {
	            	this.previous_project[objs[i].get('project_pos')].set('project_pos',objs[i].get('id')  );
	            }
	            console.log(loop);
            }
        }
        if (objs.length > 0) {
	        this.head_project = objs[0];
	        this.head_context = objs[0];
        }
        // TODO check if there's a cycle
        
        // while head is previous (so it's not head)
        while(this.head_project != null && this.previous_project[this.head_project.get('id')] != null) {
            this.head_project = this.previous_project[this.head_project.get('id')];
        }
        while(this.head_context != null && this.previous_context[this.head_context.get('id')] != null) {
            this.head_context = this.previous_context[this.head_context.get('id')];
        }
        console.log(this.previous_project.length);
        this.data.addAll(objs);
	},

	sort : function(dir, fn){
        this.data.items = [];

        var i = 0;
        var myHead = this.head_project;
        while(myHead != null) {
            this.data.items[i] = myHead;
            myHead = this.data.item(myHead.get('project_pos'));
            i++;	
        }
        this.fireEvent("sort", this);
    },

    filterBy : function(fn, scope){
        //console.log("filter by");
    	var r = new Ext.util.MixedCollection();
        // add all by head
        r.addAll(this.data.items)
    	return r;
    },

    remove : function(o) {
        console.log("remove");
    	return this.data.remove(o);
    }
});
