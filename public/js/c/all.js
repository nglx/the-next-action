CompleteColumn=function(){
var _1;
function _2(t){
var _4=_1.getView().findRowIndex(t);
return _1.store.getAt(_4);
};
function _5(e,t){
if(Ext.fly(t).hasClass("task-check")){
e.stopEvent();
var _8=_2(t);
var _9=_8.get("complete_date")==""?new Date():"";
_8.set("complete_date",_9);
_1.store.applyFilter();
}
};
function _a(e,t){
if(Ext.fly(t).hasClass("task-check")){
Ext.fly(t.parentNode).addClass("task-check-over");
}
};
function _d(e,t){
if(Ext.fly(t).hasClass("task-check")){
Ext.fly(t.parentNode).removeClass("task-check-over");
}
};
Ext.apply(this,{width:22,header:"<div class=\"task-col-hd\"></div>",fixed:true,id:"task-col",renderer:function(){
return "<div class=\"task-check\"></div>";
},init:function(xg){
_1=xg;
_1.on("render",function(){
var _11=_1.getView();
_11.mainBody.on("mousedown",_5);
_11.mainBody.on("mouseover",_a);
_11.mainBody.on("mouseout",_d);
});
}});
};
Metadata=Ext.data.Record.create([{name:"key",type:"string"},{name:"value",type:"string"}]);
MetadataStore=function(_12){
MetadataStore.superclass.constructor.call(this,{reader:new Ext.data.JsonReader({id:"key"},Metadata)});
this.dbIdent;
this.proxy=new Ext.data.SqlDB.Proxy(_12,"metadata","key",this);
if(window.google){
this.proxy.on("beforeload",this.prepareTable,_12);
}
};
Ext.extend(MetadataStore,Ext.data.Store,{prepareTable:function(){
try{
this.createTable({name:"metadata",key:"key",fields:Metadata.prototype.fields});
}
catch(e){

}
},getIdent:function(){
if(this.dbIdent==null){
var _13=this.readValue("db_ident");
if(_13==null){

_13=(new Date().getTime()-new Date("2007/06/10").getTime())+"-"+Math.floor(Math.random()*100000);
this.storeValue("db_ident",_13);
}
this.dbIdent=_13;
}

return this.dbIdent;
},getSyncAt:function(){
return this.readValue("sync_at");
},setSyncAt:function(_14){
var _15=this.getById("sync_at");
if(_15==null){
this.storeValue("sync_at",_14);
}else{
_15.set("value",_14);
}
},getLoggedId:function(){
return this.readValue("logged_id");
},setLoggedId:function(_16){
var _17=this.getById("logged_id");
if(_17==null){
this.storeValue("logged_id",_16);
}else{
_17.set("value",_16);
}
},readValue:function(key){
this.load();
var _19=this.getById(key);
return (_19==null)?null:_19.get("value");
},storeValue:function(key,_1b){
this.loadData([{key:key,value:_1b}],true);
this.fireEvent("datachanged",this);
}});
TaskChange=Ext.data.Record.create([{name:"id",type:"int"},{name:"op",type:"string"}]);
TaskChangeStore=function(_1c){
TaskStore.superclass.constructor.call(this,{reader:new Ext.data.JsonReader({id:"id"},TaskChange)});
this.proxy=new Ext.data.SqlDB.Proxy(_1c,"changes_actions","id",this);
};
Ext.extend(TaskChangeStore,Ext.data.Store,{prepareTable:function(){
try{
this.createTable({name:"changes_actions",key:"id",fields:TaskChange.prototype.fields});
}
catch(e){

}
},recordChange:function(id){
this.loadData([{id:id,op:"s"}],true);
}});
Task=Ext.data.Record.create([{name:"id",type:"int"},{name:"user_id",type:"int"},{name:"title",type:"string"},{name:"context",type:"string"},{name:"description",type:"string"},{name:"project",type:"string"},{name:"project_pos",type:"int"},{name:"context_pos",type:"int"},{name:"due_date",type:"date",dateFormat:"Y-m-d H:i:s"},{name:"complete_date",type:"date",dateFormat:"Y-m-d H:i:s"},{name:"created_at",type:"date"},{name:"updated_at",type:"date"},{name:"active",type:"int"},{name:"version",type:"int"},{name:"id_start",type:"int"},{name:"id_start_db",type:"string"},{name:"synced_at",type:"date"}]);
Task.nextId=function(){
var id=Math.floor((new Date(1970,1,1).getTime()-new Date().getTime())/1000);
return -Math.abs(id);
};
TaskStore=function(_1f){
TaskStore.superclass.constructor.call(this,{sortInfo:{field:"project_pos",direction:"ASC"},groupField:"project",taskFilter:"all",reader:new Ext.data.JsonReader({id:"id"},Task)});
this.recordChangeObserver=null;
this.changeStore=new TaskChangeStore(_1f);
this.metadataStore=new MetadataStore(_1f);
this.proxy=new Ext.data.SqlDB.Proxy(_1f,"actions","id",this);
if(window.google){
this.proxy.on("beforeload",this.prepareTable,_1f);
this.proxy.on("beforeload",this.changeStore.prepareTable,_1f);
}
this.proxy.on("recordupdated",this.recordChange,this);
this.addEvents({newcontext:true});
this.addEvents({newproject:true});
};
Ext.extend(TaskStore,Ext.data.GroupingStore,{applyFilter:function(_20){
if(_20!==undefined){
this.taskFilter=_20;
}
var _21=this.taskFilter;
return this.filterBy(function(_22){
if(_21){
return _22.data.complete_date!=="";
}else{
return _22.data.complete_date==="";
}
});
},addTask:function(_23){
_23.id_start=_23.id;
_23.id_start_db=this.metadataStore.getIdent();
_23.created_at=_23.updated_at=new Date();
if(_23.active==null){
_23.active=1;
}
if(_23.version==null){
_23.version=0;
}
this.suspendEvents();
this.clearFilter();
this.resumeEvents();
this.loadData([_23],true);
this.suspendEvents();
this.applyFilter();
this.applyGrouping(true);
this.resumeEvents();
this.fireEvent("datachanged",this);
this.fireEvent("newcontext",_23.context);
this.fireEvent("newproject",_23.project);
},prepareTable:function(){
try{
this.createTable({name:"actions",key:"id",fields:Task.prototype.fields});
}
catch(e){

}
},setRecordChangeObserver:function(_24){
this.recordChangeObserver=_24;
},recordChange:function(obj,_26){
if(_26.skipStoringChanges==true){
delete _26.skipStoringChanges;
}else{
this.changeStore.recordChange(_26.get("id"));
if(this.recordChangeObserver!=null){
this.recordChangeObserver(_26);
}
}
},reloadRecords:function(_27,_28){
if(_27&&_27.length>0){
var _29="where ";
for(var i=0;i<_27.length;i++){
_29+="id=? OR ";
}
_29+="1=2";
this.proxy.load({where:_29,args:_27},this.reader,this.myLoadRecords,this,{dbIdent:_28});
}
},myLoadRecords:function(o,_2c,_2d){
var r=o.records,t=o.totalRecords||r.length;
this.totalLength=Math.max(t,this.data.length+r.length);
for(var i=0;i<r.length;i++){
var _31=r[i];
_31.skipStoringChanges=true;
if(_31.get("active")==1){
this.suspendEvents();
this.add([_31]);
this.resumeEvents();
}else{
var _32=this.getById(_31.get("id"));
if(_32!=null){
this.remove(_32);
}
}
if(_31.get("id_start_db")==_2c.dbIdent){
var _33=this.getById(_31.get("id_start"));
if(_33!=null){
_33.skipStoringChanges=true;
this.remove(_33);
}
}
}
this.applySort();
this.applyFilter();
this.fireEvent("datachanged",this);
}});
ProjectStore=function(){
ProjectStore.superclass.constructor.call(this,{expandData:true,data:[],fields:[{name:"text",type:"string"}],sortInfo:{field:"text",direction:"ASC"},id:0});
};
Ext.extend(ProjectStore,Ext.data.SimpleStore,{init:function(_34){
var _35=_34.collect("project",false,true);
this.loadData(_35);
},addProject:function(_36){
if(_36&&this.indexOfId(_36)===-1){
this.clearFilter(true);
this.loadData([_36],true);
this.applySort();
}
}});
ContextStore=function(){
ContextStore.superclass.constructor.call(this,{expandData:true,data:[],fields:[{name:"text",type:"string"}],sortInfo:{field:"text",direction:"ASC"},id:0});
};
Ext.extend(ContextStore,Ext.data.SimpleStore,{init:function(_37){
var _38=_37.collect("context",false,true);
this.loadData(_38);
},addContext:function(cat){
if(cat&&this.indexOfId(cat)===-1){
this.clearFilter(true);
this.loadData([cat],true);
this.applySort();
}
}});
Ext.BLANK_IMAGE_URL="images/s.gif";
Ext.onReady(function(){
Ext.QuickTips.init();
var _3a=null;
function _3b(){
if(_3a!=null){
_3c.sendMessage([_3d.getIdent(),_3a],_3e);
}
};
var _3f=new Ext.Button({text:"Login / Register",iconCls:"icon-offline",handler:function(){
if(_3a==null){
_40.show();
}else{
_3f.setDisabled(true);
Ext.Ajax.request({url:"sessions/destroy",success:function(_41){
_3f.setIconClass("icon-offline");
_3f.setText("Login / Register");
_3a=null;
_3f.setDisabled(false);
},failure:function(_42){
if(action.response.status!=200){
Ext.MessageBox.alert("Status","Cannot contact external server to logout. You're probably in offline mode.");
}
_3f.setDisabled(false);
}});
}
}});
var _43=Ext.data.SqlDB.getInstance();
_43.open("gtd-actions.db");
var _44=new TaskStore(_43);
_44.setRecordChangeObserver(function(_45){
_3b();
});
var _46=new ContextStore();
var _47=new ProjectStore();
var _3d=new MetadataStore(_43);
_44.on("newcontext",_46.addContext,_46);
_44.on("newproject",_47.addProject,_47);
_44.on("add",_48);
function _49(){
Ext.Ajax.request({url:"sessions/check",success:function(_4a){
var ro=Ext.decode(_4a.responseText);
if(ro.success){
_3f.setIconClass("icon-online");
_3f.setText("Logout "+ro.login);
_3a=ro.id;
_3d.setLoggedId(ro.id);
_44.reload({params:{where:"where active=? and (user_id=? or user_id=\"\")",args:[1,_3a]},callback:function(){
_46.init(_44);
_47.init(_44);
}});
_44.applyFilter(false);
_3b();
}
}});
};
function _4c(){
_40.buttons[0].setDisabled(true);
_4d.getForm().submit({success:function(){
_40.hide();
_4d.getForm().reset();
_40.buttons[0].setDisabled(false);
_49();
},failure:function(_4e,_4f){
if(_4f.response.status!=200){
Ext.MessageBox.alert("Status","Cannot contact external server to login. You're probably in offline mode.");
}
_40.buttons[0].setDisabled(false);
},waitMsg:"Loging in..."});
};
var _4d=new Ext.form.FormPanel({labelWidth:75,labelAlign:"right",baseCls:"x-plain",maskDisabled:false,url:"sessions/create",waitMsgTarget:true,items:[{id:"loginLogin",xtype:"textfield",fieldLabel:"Login",name:"login",maxLength:60,listeners:{specialkey:function(f,o){
if(o.getKey()==13){
_4c();
}
}}},{xtype:"textfield",fieldLabel:"Password",name:"password",inputType:"password",maxLength:60,listeners:{specialkey:function(f,o){
if(o.getKey()==13){
_4c();
}
}}},{xtype:"label",html:"<div align='center'><a href='/passwords/reset'>Forgot password?</a><br><a href='/users/new'>Register for a free beta account</a></div>"}]});
var _40=new Ext.Window({bodyStyle:"padding:5px;",title:"Login",layout:"fit",width:280,height:160,closable:false,plain:true,resizable:false,modal:true,items:[_4d],buttons:[{text:"Login",handler:function(){
_4c();
}},{text:"Cancel",handler:function(){
_40.hide();
}}]});
_40.on("show",function(){
var f=Ext.get("loginLogin");
f.focus.defer(100,f);
});
function _48(_55,_56){
_44.applyGrouping();
_57(_56[0],0,0,"project","project_pos");
_57(_56[0],0,0,"context","context_pos");
};
var _58={focus:function(){
this.bindStore(_46);
},blur:function(c){
_46.purgeListeners();
}};
var _5a={focus:function(){
this.bindStore(_47);
},blur:function(c){
_47.purgeListeners();
}};
var _5c=new CompleteColumn();
var _5d=new Ext.grid.RowSelectionModel();
function _5e(_5f,_60,_61,_62){
var due=_61.get("due_date")==""?"":"due:"+Ext.util.Format.date(_61.get("due_date"),"m/d/Y");
var _64=_61.get("complete_date")==""?"":"done:"+Ext.util.Format.date(_61.get("complete_date"),"m/d/Y");
if(due!=""&&_64!=""){
due+=",";
}
if(due==""&&_64==""){
return _5f;
}else{
return _5f+"&nbsp;&nbsp;("+due+_64+")";
}
};
var _65=new Ext.StatusBar({id:"my-status",defaultText:"",items:[_3f," "," "]});
var _66=new Ext.grid.GridPanel({id:"tasks-grid",store:_44,sm:_5d,enableColumnHide:false,enableColumnMove:false,enableDragDrop:true,enableHdMenu:false,border:false,title:"Active Actions",iconCls:"icon-show-active",region:"center",bbar:_65,loadMask:true,plugins:_5c,columns:[_5c,{header:"Action",dataIndex:"title",renderer:_5e},{header:"Context",dataIndex:"context"},{header:"Project",dataIndex:"project",hidden:true}],view:new Ext.grid.GroupingView({forceFit:true,autoFill:true,ignoreAdd:true,enableRowBody:true,showPreview:true,emptyText:"No Actions to display",groupTextTpl:"{text} ({[values.rs.length]} {[values.rs.length > 1 ? \"actions\" : \"action\"]})",getRowClass:function(r,_68,p,_6a){
var d=r.data;
var _6c;
if(this.showPreview){
p.body="<p>"+d.description+"</p>";
_6c="x-grid3-row-expanded";
}else{
_6c="x-grid3-row-collapsed";
}
if(d.complete_date!=""){
_6c+=" task-completed";
}else{
if(d.due_date!=""&&d.due_date.getTime()<=new Date().clearTime().getTime()){
_6c+=" task-overdue";
}
}
return _6c;
}})});
var _6d=new Ext.Panel({frame:true,title:"Views",collapsible:true,contentEl:"task-views",titleCollapse:true});
var _6e=new Ext.Panel({frame:true,title:"Actions",collapsible:true,contentEl:"task-actions",titleCollapse:true});
var _6f=new Ext.Panel({frame:true,title:"Action Grouping",collapsible:true,contentEl:"task-grouping",titleCollapse:true});
var _70=new Ext.Panel({region:"south",border:false,baseCls:"x-plain",contentEl:"copyright"});
var _71=new Ext.Panel({id:"action-panel",region:"west",split:true,collapsible:true,collapseMode:"mini",width:200,minWidth:150,border:false,baseCls:"x-plain",items:[_6e,_6d,_6f,_70]});
var _72=new Ext.Viewport({layout:"border",items:[_71,_66]});
var ab=_71.body;
ab.on("mousedown",_74,null,{delegate:"a"});
ab.on("click",Ext.emptyFn,null,{delegate:"a",preventDefault:true});
_66.on("keydown",function(e){
if(e.getKey()==e.DELETE){
_76["action-delete"]();
}else{
if(e.getKey()==e.ENTER){
_76["action-edit"]();
}
}
});
_66.on("rowdblclick",function(e){
_76["action-edit"]();
});
_5d.on("selectionchange",function(sm){
var bd=_6e.body,c=sm.getCount();
bd.select("li:not(#new-task)").setDisplayed(c>0);
bd.select("span.s").setDisplayed(c>1);
bd.select("span.one").setDisplayed(c==1);
});
function _7b(id){
var cm=_66.colModel;
var _7e=0;
for(i=0;i<id;i++){
if(!cm.isHidden(i)){
_7e++;
}
}
return cm.getColumnWidth(_7e);
};
function _7f(_80){
var bd=_6e.body;
bd.select("span.action-complete-"+true).setDisplayed(_80);
bd.select("span.action-complete-"+false).setDisplayed(!_80);
};
var _76={"visit-home":function(){
document.location.href="http://thewayout.eu/";
},"contact":function(){
document.location.href="/contact";
},"addthis":function(){
document.location.href="http://www.addthis.com/bookmark.php?pub=thewayout&url=http%3A%2F%2Fthenextaction.morphexchange.com&title=";
},"show-details":function(){
var _82=_66.getView();
_82.showPreview=!_82.showPreview;
_82.refresh();
Ext.get("details-button-"+_82.showPreview).setDisplayed(false);
Ext.get("details-button-"+!_82.showPreview).setDisplayed(true);
},"view-active":function(){
_44.applyFilter(false);
_66.setTitle("Active Actions","icon-show-active");
_7f(true);
_83.unlock();
_44.sort(_84(),"asc");
},"view-complete":function(){
_44.applyFilter(true);
_66.setTitle("Completed Actions","icon-show-complete");
_7f(false);
_83.lock();
_44.sort("complete_date","desc");
},"action-new":function(){
_85=null;
_86.show();
},"action-edit":function(){
_85=_5d.getSelected();
_86.show();
},"action-complete":function(){
_5d.each(function(s){
s.set("complete_date",new Date());
});
_44.applyFilter();
},"action-active":function(){
_5d.each(function(s){
s.set("complete_date","");
});
_44.applyFilter();
},"action-delete":function(){
Ext.Msg.confirm("Confirm","Are you sure you want to delete the selected action(s)?",function(btn){
if(btn=="yes"){
_5d.each(function(s){
_44.remove(s);
_44.applyFilter();
});
}
});
},"group-project":function(){
_44.groupBy("project");
var w=_66.colModel.getColumnWidth(1);
var _8c=_7b(2);
_66.colModel.setHidden(3,true);
_66.colModel.setHidden(2,false);
_66.colModel.setColumnWidth(2,_8c);
_66.colModel.setColumnWidth(1,w);
if(!_44.taskFilter){
_44.sort("project_pos","asc");
}
},"group-context":function(){
_44.groupBy("context");
var w=_66.colModel.getColumnWidth(1);
var _8e=_7b(2);
_66.colModel.setHidden(2,true);
_66.colModel.setHidden(3,false);
_66.colModel.setColumnWidth(3,_8e);
_66.colModel.setColumnWidth(1,w);
if(!_44.taskFilter){
_44.sort("context_pos","asc");
}
},"no-group":function(){
_44.clearGrouping();
_66.colModel.setHidden(2,false);
_66.colModel.setHidden(3,false);
}};
function _74(e,t){
e.stopEvent();
_76[t.id]();
};
var _83=new Ext.dd.DropTarget(_66.getEl(),{ddGroup:"GridDD",copy:false,notifyDrop:function(dd,e,_93){
var sm=_66.getSelectionModel();
var _95=sm.getSelections();
var _96=dd.getDragData(e).rowIndex;
if(_96!=null){
_97(_96,_95);
sm.selectRecords(_95);
_44.applyGrouping();
}
return true;
}});
var _98=new Ext.form.FormPanel({bodyStyle:"padding:5px;",labelWidth:75,labelAlign:"right",baseParams:{id:""},baseCls:"x-plain",items:[{xtype:"textfield",fieldLabel:"Title",name:"title",width:250,maxLength:60,id:"titleInput",allowBlank:false},{xtype:"textarea",fieldLabel:"Description",name:"description",width:250,height:169},{xtype:"combo",fieldLabel:"Project",name:"project",displayField:"text",mode:"local",maxLength:30,listeners:_5a},{xtype:"combo",fieldLabel:"Context",name:"context",displayField:"text",mode:"local",maxLength:30,listeners:_58},{xtype:"datefield",fieldLabel:"Due date",name:"due_date",format:"m/d/Y"}]});
var _85;
function _99(){
_86.reset();
_86.hide();
};
var _86=new Ext.Window({title:"Action",width:360,height:360,closable:false,plain:true,resizable:false,modal:true,items:_98,buttons:[{text:"Save",handler:function(){
var _9a=_98.getForm();
if(_9a.isValid()){
if(_85){
var _9b=_85.get("context");
var _9c=_85.get("project");
_9a.updateRecord(_85);
_44.fireEvent("newcontext",_85.get("context"));
_44.fireEvent("newproject",_85.get("project"));
if(_9a.getValues()["context"]!=_9b){
_85.set("context_pos",-1);
}
if(_9a.getValues()["project"]!=_9c){
_85.set("project_pos",-1);
}
_44.applyGrouping();
if(_9a.getValues()["context"]!=_9b){
_57(_85,0,0,"context","context_pos");
}
if(_9a.getValues()["project"]!=_9c){
_57(_85,0,0,"project","project_pos");
}
_85.status=1;
}else{
var _9d=_9a.getValues();
var _9e=_9a.findField("due_date").getValue();
var id=Task.nextId();
var _a0={id:id,title:_9d["title"],project:_9d["project"],description:_9d["description"],context:_9d["context"],complete_date:"",project_pos:-1,context_pos:-1,due_date:_9e||""};
_44.addTask(_a0);
}
_86.hide();
_98.getForm().reset();
}
}},{text:"Cancel",handler:function(){
_86.hide();
_98.getForm().reset();
_98.getForm().clearInvalid();
}}]});
_86.on("show",function(){
if(_85){
_98.getForm().loadRecord(_85);
}
var f=Ext.get("titleInput");
f.focus.defer(100,f);
});
function _84(){
return _44.groupField=="project"?"project_pos":"context_pos";
};
function _a2(){
return _44.groupField=="project"?"project":"context";
};
function _57(_a3,_a4,_a5,_a6,_a7){
var _a8=_44.indexOf(_a3);
for(var i=0;;i++){
var _aa=_44.getAt(_a8);
if(!_aa){
break;
}
var _ab=_aa.get(_a6);
if(_ab==_a3.get(_a6)){
_aa.set(_a7,_a4+_a5+i);
}else{
break;
}
_a8++;
}
};
function _97(_ac,_ad){
var _ae=_44.getAt(_ac);
var _af=_ae.get(_84());
_57(_ae,_af,_ad.length,_a2(),_84());
for(i=0;i<_ad.length;i++){
rowData=_44.getById(_ad[i].id);
rowData.set(_84(),_af++);
rowData.set(_a2(),_ae.get(_a2()));
}
};
var _3c=google.gears.factory.create("beta.workerpool");
var _3e=_3c.createWorkerFromUrl("js/c/sync-worker.js");
var _b0=_3c.createWorkerFromUrl("js/c/offline-worker.js");
var _b1=-1;
_3c.onmessage=function(a,b,_b4){

if(_b4.sender==_b0){
if(true==_b4.body&&_3a!=null){
_3b();
}else{
if(false==_b4.body){
_65.setStatus({text:"Application went offline",clear:true});
}
}
}else{
if(_b4.sender==_3e){
var op=_b4.body[0];
if("start"==op){
_65.showBusy("Synchronizing...");
}else{
if("finish"==op){
var _b6=_b4.body[1];
if(_b6==true){
var _b7=_b4.body[2];
_44.reloadRecords(_b7,_3d.getIdent());
if(_b7.length>0){
_46.init(_44);
_47.init(_44);
}
}
_65.clearStatus();
var _b8=_b7.length==1?" action.":" actions.";
_65.setStatus({text:"Synchronized "+_b7.length+_b8,clear:true});
}
}
}else{
if(_b4.sender==_b1){
_65.clearStatus();
_44.reload({params:{where:"where active=? and (user_id=? or user_id=\"\")",args:[1,_3a]},callback:function(){
_46.init(_44);
_47.init(_44);
}});
_3b();
}
}
}
};
_3c.sendMessage("register",_b0);
_49();
_43.query("select count(*) as ilosc from sqlite_master where name='task'",function(rs){
var _ba=(rs[0]["ilosc"]==1);
if(_ba){
_65.showBusy("Migrating tasks...");
_b1=_3c.createWorkerFromUrl("js/c/migrate-worker.js");
_3c.sendMessage([_3d.getIdent()],_b1);
}
});
_44.load({params:{where:"where active=? and (user_id=? or user_id=\"\")",args:[1,_3d.getLoggedId()]},callback:function(){
_46.init(_44);
_47.init(_44);
}});
_44.applyFilter(false);
});
var STORE_NAME="thenextaction_docset";
var MANIFEST_FILENAME="manifest.json";
var localServer;
var store;
function initOffline(){
if(!window.google||!google.gears){
alert("You must install Google Gears first.");
}else{
localServer=google.gears.factory.create("beta.localserver","1.0");
store=localServer.createManagedStore(STORE_NAME);
createStore();
}
};
function createStore(){
store.manifestUrl=MANIFEST_FILENAME;
store.checkForUpdate();
var _bb=window.setInterval(function(){
var _bc=Ext.getCmp("my-status");
if(store.currentVersion){
if(store.updateStatus==0){
if(_bc!=null){
_bc.clearStatus();
_bc.setStatus({text:"Application is ready for offline mode",clear:true});
}
}
window.clearInterval(_bb);
}else{
if(store.updateStatus==3){
if(_bc!=null){
_bc.setStatus({text:"Error on downloading: "+store.lastErrorMessage,clear:true});
}
}else{
if(store.updateStatus==2){
_bc.clearStatus();
if(_bc!=null){
_bc.showBusy("Downloading application for offline use...");
}
}
}
}
},500);
};

