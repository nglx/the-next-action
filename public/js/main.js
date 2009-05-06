Ext.BLANK_IMAGE_URL = 'images/s.gif';

Ext.onReady(function(){
    Ext.QuickTips.init();

    var loggedId = null;
    function synchronize() {
      if (loggedId != null) {
        workerPool.sendMessage([metadataStore.getIdent(), loggedId], syncWorkierId);
      }
    }

    //Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

    var loginButton = new Ext.Button({
        text: 'Login / Register',
        iconCls:'icon-offline',
        handler: function() {
            if (loggedId==null) {
                loginWindow.show();
            } else {
                loginButton.setDisabled(true);
                Ext.Ajax.request({
                    url : 'sessions/destroy',
                    success : function(result) {
                        loginButton.setIconClass('icon-offline');
                        loginButton.setText("Login / Register");
                        loggedId = null;
                        loginButton.setDisabled(false);
                    },
                    failure : function(result) {
		                if (action.response.status != 200) {
                            Ext.MessageBox.alert('Status', "Cannot contact external server to logout. You're probably in offline mode.");
		                }
                        loginButton.setDisabled(false);
                    }
                });                 
            }
        }
    });

    var conn = Ext.data.SqlDB.getInstance();
    conn.open('gtd-actions.db');

    var taskStore = new TaskStore(conn);
    taskStore.setRecordChangeObserver(function(record){
      synchronize();
    });
    
    var contextStore = new ContextStore();
    var projectStore = new ProjectStore();

    var metadataStore = new MetadataStore(conn);

    taskStore.on('newcontext', contextStore.addContext, contextStore);
    taskStore.on('newproject', projectStore.addProject, projectStore);
    taskStore.on('add', numberAfterInsertRows)


    function updateLoginStatus() {
        Ext.Ajax.request({
            url : 'sessions/check',
            success : function(result) {
                var ro = Ext.decode(result.responseText);
                if (ro.success) {
	                loginButton.setIconClass('icon-online');
	                loginButton.setText("Logout "+ro.login);
	                loggedId = ro.id;
	                // remember logged id
	                metadataStore.setLoggedId(ro.id);
	                // reload task store with users actions
				    taskStore.reload({
				        params: {
				            where: 'where active=? and (user_id=? or user_id="")',
				            args: [1, loggedId]
				        },
				        callback: function(){
				            contextStore.init(taskStore);
				            projectStore.init(taskStore);
				        }
				    });
                    taskStore.applyFilter(false);
	                synchronize();
                }
            }
        });        
    }

    function login() {
        loginWindow.buttons[0].setDisabled(true);
        loginForm.getForm().submit({
            success: function() {
                loginWindow.hide();
                loginForm.getForm().reset();
                loginWindow.buttons[0].setDisabled(false);
                updateLoginStatus();
            },
            failure: function(form, action) {
                if (action.response.status != 200) {
                    Ext.MessageBox.alert('Status', "Cannot contact external server to login. You're probably in offline mode.");
                }
                loginWindow.buttons[0].setDisabled(false);
            },
            waitMsg:'Loging in...'
        });
    }

	var loginForm = new Ext.form.FormPanel({
        labelWidth: 75,
        labelAlign: 'right',
        baseCls:'x-plain',
        maskDisabled:false,
        url: 'sessions/create',
        waitMsgTarget: true,

        items:[{
			id:"loginLogin",
            xtype:"textfield",
            fieldLabel:"Login",
            name:"login",
            maxLength: 60,
            listeners:{
                specialkey : function(f,o){
                    if(o.getKey()==13){
                        login();
                    }
                }
            }
          },{
            xtype:"textfield",
            fieldLabel:"Password",
            name:"password",
            inputType:"password",
            maxLength: 60,
            listeners:{
                specialkey : function(f,o){
                    if(o.getKey()==13){
                        login();
                    }
                }
            }
          },{
            xtype:"label",
            html:"<div align='center'><a href='/passwords/reset'>Forgot password?</a><br><a href='/users/new'>Register for a free beta account</a></div>"
          }]
    });

    var loginWindow = new Ext.Window({
        bodyStyle:'padding:5px;',
        title:"Login",
        layout:'fit',
        width:280,
        height:160,
        closable:false,
        plain:true,
        resizable:false,
        modal:true,
        items:[loginForm],

        buttons: [{
            text:'Login',
            handler: function(){
                login();
            }
        },{
            text: 'Cancel',
            handler: function(){
            	loginWindow.hide();
            }
        }]
    });

    loginWindow.on('show', function() {
        var f = Ext.get('loginLogin');
        f.focus.defer(100, f);
    });

    function numberAfterInsertRows(inserted, rows) {
        taskStore.applyGrouping();
        numberRows(rows[0], 0, 0, 'project', 'project_pos');
        numberRows(rows[0], 0, 0, 'context', 'context_pos');
    }

    // set of event handlers shared by combos to allow them to share
    // the same local store
    var catComboEvents = {
        focus: function(){
            this.bindStore(contextStore);
        },
        blur: function(c){
            contextStore.purgeListeners();
        }
    }
    var projComboEvents = {
        focus: function(){
            this.bindStore(projectStore);
        },
        blur: function(c){
            projectStore.purgeListeners();
        }
    }

    var completeColumn = new CompleteColumn();

    var selections = new Ext.grid.RowSelectionModel();

    function title_renderer(cell_data, meta_data, record, row_index) {
       var due = record.get('due_date') == '' ? '' : 'due:'+Ext.util.Format.date(record.get('due_date'),'m/d/Y');
       var completed = record.get('complete_date') == '' ? '' : 'done:'+Ext.util.Format.date(record.get('complete_date'),'m/d/Y');
       if (due != '' && completed != '')
           due += ','
       if (due == '' && completed == '')
           return cell_data;
       else
           return cell_data+'&nbsp;&nbsp;('+due+completed+')';
    }

    var statusBar = new Ext.StatusBar({
            id: 'my-status',
            defaultText: '',
            items: [loginButton , ' ', ' ']
        });

    // The main grid in all it's configuration option glory
    var grid = new Ext.grid.GridPanel({
        id:'tasks-grid',
        store: taskStore,
        sm: selections,
        enableColumnHide:false,
        enableColumnMove:false,
        enableDragDrop:true,
        enableHdMenu:false,
        border:false,
        title:'Active Actions',
        iconCls:'icon-show-active',
        region:'center',
        bbar: statusBar,
        loadMask: true,
        plugins: completeColumn,

        columns: [
            completeColumn,
            {
                header: "Action",
                //width:k00,
                dataIndex: 'title',
                renderer: title_renderer
            },
            {
                header: "Context",
                //width:300,
                //sortable: true,
                dataIndex: 'context'
            },
            {
                header: "Project",
                //width:300,
                //sortable: true,
                dataIndex: 'project',
                hidden: true
            }
        ],

        view: new Ext.grid.GroupingView({
            forceFit:true,
            autoFill:true,
            ignoreAdd: true,
            enableRowBody:true,
            showPreview:true,
            emptyText: 'No Actions to display',
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "actions" : "action"]})',

            getRowClass : function(r, rowIndex, p, store){
                var d = r.data;
                var style;
                if(this.showPreview){
                    p.body = "<p>"+d.description+"</p>";
                    style = 'x-grid3-row-expanded';
                }else{
                    style = 'x-grid3-row-collapsed';
                }
                if(d.complete_date != ''){
                    style += ' task-completed';
                }else if (d.due_date != '' && d.due_date.getTime() <= new Date().clearTime().getTime()){
                    style += ' task-overdue';
                }
                return style;
            }
        })
    });

    var viewPanel = new Ext.Panel({
        frame:true,
        title: 'Views',
        collapsible:true,
        contentEl:'task-views',
        titleCollapse: true
    });

    var taskActions = new Ext.Panel({
        frame:true,
        title: 'Actions',
        collapsible:true,
        contentEl:'task-actions',
        titleCollapse: true
    });

    var groupActions = new Ext.Panel({
        frame:true,
        title: 'Action Grouping',
        collapsible:true,
        contentEl:'task-grouping',
        titleCollapse: true
    });

    var copyrightPanel = new Ext.Panel({
        region:'south',
        border: false,
        baseCls:'x-plain',
        contentEl:'copyright'
    });

    var actionPanel = new Ext.Panel({
        id:'action-panel',
        region:'west',
        split:true,
        collapsible: true,
        collapseMode: 'mini',
        width:200,
        minWidth: 150,
        border: false,
        baseCls:'x-plain',
        items: [taskActions, viewPanel, groupActions, copyrightPanel]
    });

    var viewport = new Ext.Viewport({
        layout:'border',
        items: [actionPanel, grid]
    });

    var ab = actionPanel.body;
    ab.on('mousedown', doAction, null, {delegate:'a'});
    ab.on('click', Ext.emptyFn, null, {delegate:'a', preventDefault:true});

    grid.on('keydown', function(e){
         if(e.getKey() == e.DELETE){
             actions['action-delete']();
         } else if(e.getKey() == e.ENTER){
             actions['action-edit']();
         }
    });
    grid.on('rowdblclick', function(e){
        actions['action-edit']();
    });

    selections.on('selectionchange', function(sm){
        var bd = taskActions.body, c = sm.getCount();
        bd.select('li:not(#new-task)').setDisplayed(c > 0);
        bd.select('span.s').setDisplayed(c > 1);
        bd.select('span.one').setDisplayed(c == 1);
    });

    function getVisibleWidth(id) {
        var cm = grid.colModel;
        var notHiddenId = 0;
        for(i=0; i<id; i++){
            if (!cm.isHidden(i)) {
              notHiddenId++;
            }
        }
        return cm.getColumnWidth(notHiddenId);
    }

    function setCompleteActionVisibility(active) {
        var bd = taskActions.body;
        bd.select('span.action-complete-'+true).setDisplayed(active)
        bd.select('span.action-complete-'+false).setDisplayed(!active)
    }

    var actions = {
        'visit-home' : function() {
           document.location.href = 'http://thewayout.eu/';
        },
        'contact' : function() {
           document.location.href = '/contact';
        },
        'addthis' : function() {
           document.location.href = 'http://www.addthis.com/bookmark.php?pub=thewayout&url=http%3A%2F%2Fthenextaction.morphexchange.com&title=';
        },
        'show-details' : function(){
            var view = grid.getView();
            view.showPreview = !view.showPreview;
            view.refresh();
            Ext.get('details-button-'+view.showPreview).setDisplayed(false);
            Ext.get('details-button-'+!view.showPreview).setDisplayed(true);
        },

        'view-active' : function(){
            taskStore.applyFilter(false);
            grid.setTitle('Active Actions', 'icon-show-active');
            setCompleteActionVisibility(true);
            ddrow.unlock();
            taskStore.sort(groupedFieldPos(), 'asc');
        },

        'view-complete' : function(){
            taskStore.applyFilter(true);
            grid.setTitle('Completed Actions', 'icon-show-complete');
            setCompleteActionVisibility(false);
            ddrow.lock();
            taskStore.sort('complete_date', 'desc');
        },

        'action-new' : function(){
            editedRecord = null;
            addWindow.show();
        },

        'action-edit' : function(){
            editedRecord = selections.getSelected();
            addWindow.show();
        },

        'action-complete' : function(){
            selections.each(function(s){
                s.set('complete_date', new Date());
            });
            taskStore.applyFilter();
        },

        'action-active' : function(){
            selections.each(function(s){
                s.set('complete_date', '');
            });
            taskStore.applyFilter();
        },

        'action-delete' : function(){
            Ext.Msg.confirm('Confirm', 'Are you sure you want to delete the selected action(s)?',
            function(btn){
                if(btn == 'yes'){
                    selections.each(function(s){
                        taskStore.remove(s);
                        // to recalculate count of actions
                        taskStore.applyFilter();
                    });
                }
            });
        },

        'group-project' : function(){
            taskStore.groupBy('project');
            var w = grid.colModel.getColumnWidth(1);

            // refactor me to switch cols
            var visW = getVisibleWidth(2)
            grid.colModel.setHidden(3,true);

            grid.colModel.setHidden(2,false);
            grid.colModel.setColumnWidth(2,visW);
            //

            grid.colModel.setColumnWidth(1,w);
            if (!taskStore.taskFilter)
                taskStore.sort('project_pos', 'asc');
        },

        'group-context' : function(){
            taskStore.groupBy('context');
            var w = grid.colModel.getColumnWidth(1);

            var visW = getVisibleWidth(2)
            grid.colModel.setHidden(2,true);

            grid.colModel.setHidden(3,false);
            grid.colModel.setColumnWidth(3,visW);

            grid.colModel.setColumnWidth(1,w);
            if (!taskStore.taskFilter)
                taskStore.sort('context_pos', 'asc');
        },

        'no-group' : function(){
            taskStore.clearGrouping();
//            grid.colModel.setColumnWidth(2,150);
//            grid.colModel.setColumnWidth(3,150);
            grid.colModel.setHidden(2,false);
            grid.colModel.setHidden(3,false);
        }
    };

    function doAction(e, t){
        e.stopEvent();
        actions[t.id]();
    }

    var ddrow = new Ext.dd.DropTarget(grid.getEl(), {
        ddGroup : 'GridDD',
        copy:false,
        notifyDrop : function(dd, e, data){
            var sm=grid.getSelectionModel();
            var rows=sm.getSelections();
            var cindex=dd.getDragData(e).rowIndex;
            if (cindex != null) {
                recalculatePositions(cindex, rows);
                sm.selectRecords(rows);
                taskStore.applyGrouping();
            }
            return true;
        }
    });

    var addForm = new Ext.form.FormPanel({
        bodyStyle:'padding:5px;',
        labelWidth: 75,
        labelAlign: 'right',
        baseParams: {id:''},
        baseCls:'x-plain',
        items:[{
            xtype:"textfield",
            fieldLabel:"Title",
            name:"title",
            width:250,
            maxLength: 60,
            id: 'titleInput',
            allowBlank:false
          },{
            xtype:"textarea",
            fieldLabel:"Description",
            name:"description",
            width:250,
            height:169
          },{
            xtype:"combo",
            fieldLabel:"Project",
            name:"project",
            displayField: 'text',
            mode:'local',
            maxLength: 30,
            listeners: projComboEvents
          },{
            xtype:"combo",
            fieldLabel:"Context",
            name:"context",
            displayField: 'text',
            mode:'local',
            maxLength: 30,
            listeners: catComboEvents
          },{
            xtype:"datefield",
            fieldLabel:"Due date",
            name:"due_date",
            //value: new Date(),
            format : "m/d/Y"
          }]
    });

    var editedRecord;


    function onCloseWindow() {
        addWindow.reset();
        addWindow.hide();
    }
    var addWindow = new Ext.Window({
        title:"Action",
        //layout:'fit',
        width:360,
        height:360,
        closable:false,
        //closeAction:'hide',
        plain:true,
        resizable:false,
        modal:true,
        items: addForm,

        buttons: [{
            text:'Save',
            handler: function(){
                var form = addForm.getForm();
                if (form.isValid()) {
                    if (editedRecord) {
                        var oldContext = editedRecord.get('context');
                        var oldProject = editedRecord.get('project');
                        form.updateRecord(editedRecord);
                        taskStore.fireEvent('newcontext', editedRecord.get('context'));
                        taskStore.fireEvent('newproject', editedRecord.get('project'));
                        // refactor me
                        if (form.getValues()['context'] != oldContext) {
                            editedRecord.set('context_pos',-1);
                        }
                        if (form.getValues()['project'] != oldProject) {
                            editedRecord.set('project_pos',-1);
                        }
                        taskStore.applyGrouping();
                        if (form.getValues()['context'] != oldContext) {
                            numberRows(editedRecord, 0, 0, 'context', 'context_pos');
                        }
                        if (form.getValues()['project'] != oldProject) {
                            numberRows(editedRecord, 0, 0, 'project', 'project_pos');
                        }
                        editedRecord.status = 1;
                        //workerPool.sendMessage(editedRecord, childWorkerId);
                    }else{
                        var values = form.getValues()
                        var due_date = form.findField('due_date').getValue();
                        var id = Task.nextId();
                        var task = {
                            id: id,
                            title: values['title'],
                            project: values['project'],
                            description: values['description'],
                            context: values['context'],
                            complete_date: '',
                            project_pos: -1,
                            context_pos: -1,
                            due_date: due_date||''
                        }
                        taskStore.addTask(task);
                        //workerPool.sendMessage(task, childSId);
                    }
                    addWindow.hide();
                    addForm.getForm().reset();
                }
            }
        },{
            text: 'Cancel',
            handler: function(){
                addWindow.hide();
                addForm.getForm().reset();
                addForm.getForm().clearInvalid()
            }
        }]
    });

    addWindow.on('show', function() {
        if (editedRecord) {
            addForm.getForm().loadRecord(editedRecord);
        }
        var f = Ext.get('titleInput');
        f.focus.defer(100, f);
    });


    // grid, groupedby
    function groupedFieldPos() {
        return taskStore.groupField == 'project' ? 'project_pos' : 'context_pos';
    }

    function groupedField() {
        return taskStore.groupField == 'project' ? 'project' : 'context';
    }

    function numberRows(dropRow, offsetPos, moveAbout, field, fieldPos) {
        var toIncreaseIndex = taskStore.indexOf(dropRow);//dropIndex;
        for(var i=0;;i++){
            var toIncreaseRow = taskStore.getAt(toIncreaseIndex);
            if (!toIncreaseRow) break; //the end of list?
            var rowGroupedValue = toIncreaseRow.get(field)
            if (rowGroupedValue == dropRow.get(field)) {
                toIncreaseRow.set(fieldPos, offsetPos+moveAbout+i)
            } else {
                break;
            }
            toIncreaseIndex++;
        }

    }

    function recalculatePositions(dropIndex, dragRows) {
        var dropRow = taskStore.getAt(dropIndex);
        var insertedPos = dropRow.get(groupedFieldPos());

        // pojedz po w grupie nastepnych i zwieksz o ilosc wstawianych
        numberRows(dropRow, insertedPos, dragRows.length, groupedField(), groupedFieldPos());
        // ponumeruj wstawione
        for(i = 0; i < dragRows.length; i++) {
            rowData=taskStore.getById(dragRows[i].id);
            rowData.set(groupedFieldPos(), insertedPos++);
            // zmien wartosc przy zmianie grupy
            rowData.set(groupedField(),dropRow.get(groupedField()));
        }
    }
    
    var workerPool = google.gears.factory.create('beta.workerpool');
    var syncWorkierId = workerPool.createWorkerFromUrl('js/sync-worker.js');
    var offlineWorkerId = workerPool.createWorkerFromUrl('js/offline-worker.js');
    var migrateWorkerId = -1;
    workerPool.onmessage = function(a, b, message) {
      
      console.log('Received message from worker ' + message.sender + ': \n' + message.body + (message.sender == migrateWorkerId));
    
      if (message.sender == offlineWorkerId) {
        if (true == message.body && loggedId != null) {
          // trigger sync cause we appear online
          synchronize();
        } else if (false == message.body) {
            statusBar.setStatus({
                text: 'Application went offline',
                clear: true
            });
        }
      } else if (message.sender == syncWorkierId) {
        var op = message.body[0];
        if ('start' == op) {
          statusBar.showBusy("Synchronizing...");
        } else if ('finish' == op) {
          // implement handling
          // sync should be generated at server side and stored locally
          var success = message.body[1];
          if (success == true) {
            var changedIds = message.body[2];
            taskStore.reloadRecords(changedIds, metadataStore.getIdent());
            
            if (changedIds.length > 0) {
              contextStore.init(taskStore);
              projectStore.init(taskStore);
            }
          }
          statusBar.clearStatus();
          var actionOrAction = changedIds.length == 1 ? ' action.' : ' actions.';
          statusBar.setStatus({
              text: 'Synchronized '+changedIds.length+actionOrAction,
              clear: true
          });
        }
      } else if (message.sender == migrateWorkerId) {
            statusBar.clearStatus();
            taskStore.reload({
                params: {
                    where: 'where active=? and (user_id=? or user_id="")',
                    args: [1, loggedId]
                },
                callback: function(){
                    contextStore.init(taskStore);
                    projectStore.init(taskStore);
                }
            });
            synchronize();
        }
    };
    workerPool.sendMessage("register", offlineWorkerId);

    updateLoginStatus();
    
    // run migration if needed
    conn.query("select count(*) as ilosc from sqlite_master where name='task'", function(rs) {
        var exists = (rs[0]['ilosc'] == 1);
        if (exists) {
            statusBar.showBusy("Migrating tasks...");
            migrateWorkerId = workerPool.createWorkerFromUrl('js/migrate-worker.js');
            workerPool.sendMessage([metadataStore.getIdent()], migrateWorkerId);
        }
    });

    taskStore.load({
        params: {
            where: 'where active=? and (user_id=? or user_id="")',
            args: [1, metadataStore.getLoggedId()]
        },
        callback: function(){
            contextStore.init(taskStore);
            projectStore.init(taskStore);
        }
    });
    taskStore.applyFilter(false);

});
