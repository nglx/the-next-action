var STORE_NAME = "thenextaction_docset";

var MANIFEST_FILENAME = "manifest.json";

var localServer;
var store;

// Called onload to initialize local server and store variables
function initOffline() {
  if (!window.google || !google.gears) {
    alert("You must install Google Gears first.");
  } else {
    localServer = google.gears.factory.create("beta.localserver","1.0");
    store = localServer.createManagedStore(STORE_NAME);
    createStore();
  }
}

// Create the managed resource store
function createStore() {
  store.manifestUrl = MANIFEST_FILENAME;
  store.checkForUpdate();

  var timerId = window.setInterval(function() {
    // When the currentVersion property has a value, all of the resources
    // listed in the manifest file for that version are captured. There is
    // an open bug to surface this state change as an event.
    var statusBar = Ext.getCmp('my-status');

    if (store.currentVersion) {
      if (store.updateStatus == 0) {
        if (statusBar != null) {
          statusBar.clearStatus();
          statusBar.setStatus({
            text: 'Application is ready for offline mode',
            clear: true
          });
        }
      }
      window.clearInterval(timerId);
    } else if (store.updateStatus == 3) {
      if (statusBar != null) {
	      statusBar.setStatus({
	        text: 'Error on downloading: ' + store.lastErrorMessage,
	        clear: true
	      });
      }
    } else if (store.updateStatus == 2) {
      statusBar.clearStatus();
      if (statusBar != null) {
          statusBar.showBusy("Downloading application for offline use...");
      }    
    }
  }, 500);
}
