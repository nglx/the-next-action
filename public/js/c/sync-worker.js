function Console(){
var _1="";
this.log=function(_2){
};
this.readLog=function(){
var _3=""+_1;
_1="";
return _3;
};
};
var console=new Console();
function GearsDB(_4){
this.db=this.getDB(_4);
};
GearsDB.prototype.getDB=function(_5){

try{
var db=google.gears.factory.create("beta.database","1.0");
db.open(_5);
return db;
}
catch(e){

}
};
GearsDB.prototype.selectAll=function(_7,_8,_9){
var rs=this.run(_7,_8);
if(!_9){
var _b=[];
_9=function(o){
_b.push(o);
};
this.resultSetToObjects(rs,_9);
return _b;
}else{
return this.resultSetToObjects(rs,_9);
}
};
GearsDB.prototype.selectOne=function(_d,_e){
var rs=this.run(_d,_e);
return this.resultSetToObject(rs);
};
GearsDB.prototype.selectRow=function(_10,_11,_12,_13){
return this.selectOne(this.selectSql(_10,_11,_13),_12);
};
GearsDB.prototype.selectRows=function(_14,_15,_16,_17,_18){
return this.selectAll(this.selectSql(_14,_15,_18),_16,_17);
};
GearsDB.prototype.run=function(sql,_1a){
try{
var _1b="";
if(_1a){
_1b=" with args: "+_1a.join(", ");
}

return this.db.execute(sql,_1a);
}
catch(e){
var _1b="";
if(_1a){
_1b=" with args: "+_1a.join(", ");
}

}
};
GearsDB.prototype.insertRow=function(_1c,o,_1e,_1f){
if(_1e){
var _20=this.selectOne("select rowid from "+_1c+" where "+_1e,_1f);
if(_20){
var _21="";
if(_1f){
_21=" with args: "+_1f.join(", ");
}

return;
}
}
var _22=[];
var _23=[];
for(var x in o){
if(o.hasOwnProperty(x)){
_22.push(x);
_23.push(o[x]);
}
}
this.run(this.insertSql(_1c,_22),_23);
};
GearsDB.prototype.deleteRow=function(_25,o){
var _27=[];
var _28=[];
for(var x in o){
if(o.hasOwnProperty(x)){
_27.push(x);
_28.push(o[x]);
}
}
this.run(this.deleteSql(_25,_27),_28);
};
GearsDB.prototype.updateRow=function(_2a,o,_2c){
if(!_2c){
_2c="id";
}
var _2d=[];
var _2e=[];
for(var x in o){
if(o.hasOwnProperty(x)){
_2d.push(x);
_2e.push(o[x]);
}
}
_2e.push(o[_2c]);
this.run(this.updateSql(_2a,_2d,_2c),_2e);
};
GearsDB.prototype.forceRow=function(_30,o,_32){
if(!_32){
_32="id";
}
var _33=this.selectRow(_30,_32+" = ?",[o[_32]],"rowid");
if(_33){
this.updateRow(_30,o,_32);
}else{
this.insertRow(_30,o);
}
};
GearsDB.prototype.dropTable=function(_34){
this.run("delete from "+_34);
this.run("drop table "+_34);
};
GearsDB.prototype.getColumns=function(rs){
var _36=rs.fieldCount();
var _37=[];
for(var i=0;i<_36;i++){
_37.push(rs.fieldName(i));
}
return _37;
};
GearsDB.prototype.resultSetToObjects=function(rs,_3a){
try{
if(rs&&rs.isValidRow()){
var _3b=this.getColumns(rs);
while(rs.isValidRow()){
var h={};
for(i=0;i<_3b.length;i++){
h[_3b[i]]=rs.field(i);
}
_3a(h);
rs.next();
}
}
}
catch(e){

}
finally{
rs.close();
}
};
GearsDB.prototype.resultSetToObject=function(rs){
try{
if(rs&&rs.isValidRow()){
var _3e=this.getColumns(rs);
var h={};
for(i=0;i<_3e.length;i++){
h[_3e[i]]=rs.field(i);
}
return h;
}
}
catch(e){

}
finally{
rs.close();
}
};
GearsDB.prototype.selectSql=function(_40,_41,_42){
if(!_42){
_42="*";
}
return "select "+_42+" from "+_40+" where "+_41;
};
GearsDB.prototype.insertSql=function(_43,_44){
var _45=[];
for(var i=0;i<_44.length;i++){
_45.push("?");
}
return "insert into "+_43+" ("+_44.join(",")+")"+" VALUES ("+_45.join(",")+")";
};
GearsDB.prototype.deleteSql=function(_47,_48){
var _49=[];
for(var i=0;i<_48.length;i++){
_49.push(_48[i]+"=?");
}
return "delete from "+_47+" where "+_49.join(" and ");
};
GearsDB.prototype.updateSql=function(_4b,_4c,_4d){
if(!_4d){
_4d="id";
}
var set=[];
for(var i=0;i<_4c.length;i++){
set.push(_4c[i]+"=?");
}
return "update "+_4b+" set "+set.join(", ")+" where "+_4d+"= ?";
};
toJsonString=function(arg){
return toJsonStringArray(arg).join("");
};
toJsonStringArray=function(arg,out){
out=out||new Array();
var u;
switch(typeof arg){
case "object":
if(arg){
if(arg.constructor==Array){
out.push("[");
for(var i=0;i<arg.length;++i){
if(i>0){
out.push(",\n");
}
toJsonStringArray(arg[i],out);
}
out.push("]");
return out;
}else{
if(typeof arg.toString!="undefined"){
out.push("{");
var _55=true;
for(var i in arg){
var _56=out.length;
if(!_55){
out.push(",\n");
}
toJsonStringArray(i,out);
out.push(":");
toJsonStringArray(arg[i],out);
if(out[out.length-1]==u){
out.splice(_56,out.length-_56);
}else{
_55=false;
}
}
out.push("}");
return out;
}
}
return out;
}
out.push("null");
return out;
case "unknown":
case "undefined":
case "function":
out.push(u);
return out;
case "string":
out.push("\"");
out.push(arg.replace(/(["\\])/g,"\\$1").replace(/\r/g,"").replace(/\n/g,"\\n"));
out.push("\"");
return out;
default:
out.push(String(arg));
return out;
}
};
function readChanged(_57){
var out=new Array();
var i=0;
gearsDb.selectAll("select * from changes_actions",null,function(_5a){
action=gearsDb.selectOne("select * from actions where id=? and (user_id=? or user_id='')",[_5a.id,_57]);
if(action){
out[i++]=action;
}
});
return out;
};
function synchronizeRequest(_5b,_5c){
google.gears.workerPool.sendMessage(["start"],_5b);
var _5d=_5c.body[0];
var _5e=_5c.body[1];
var _5f=gearsDb.selectOne("select sync_at from sync_at where user_id=?",[_5e]);
if(_5f!=null){
_5f=_5f.sync_at;
}
request.open("POST","/actions/sync");
request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
request.onreadystatechange=function(){
if(request.readyState==4){
eval("var out = "+request.responseText);
var _60=out.data;
var _61=new Array();
for(var i=0;i<_60.length;i++){
var _63=_60[i];
gearsDb.forceRow("actions",_63);
if(_63.id_start_db==_5d&&_63.version==1){
gearsDb.deleteRow("changes_actions",{id:_63.id_start});
gearsDb.deleteRow("actions",{id:_63.id_start});
}else{
gearsDb.deleteRow("changes_actions",{id:_63.id});
}
if(_63.active==0){
gearsDb.deleteRow("actions",{id:_63.id});
}
_61[i]=_63.id;
}
gearsDb.forceRow("sync_at",{user_id:_5e,sync_at:""+out.sync_at},"user_id");
google.gears.workerPool.sendMessage(["finish",out.success,_61,_5f],_5b);
}
};
request.send("db_ident="+_5d+"&sync_at="+_5f+"&data="+toJsonString(readChanged(_5e)));
};
var IDLE_TIME=3000;
var gearsDb=new GearsDB("gtd-actions.db");
var request=google.gears.factory.create("beta.httprequest");
var timer=google.gears.factory.create("beta.timer");
var messageCount=0;
gearsDb.run("CREATE TABLE IF NOT EXISTS sync_at(user_id INTEGER PRIMARY KEY, sync_at TEXT)");
google.gears.workerPool.onmessage=function(_64,_65,_66){
messageCount++;
var _67=messageCount;
timer.setTimeout(function(){
if(_67==messageCount){
synchronizeRequest(_65,_66);
}
},IDLE_TIME);
};

