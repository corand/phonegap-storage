var app = {

    initialize: function() {
        this.bindEvents();
        
        $("#download").on('click',this.download);
        $("#check").on('click',this.checkIfExists);
        $("#remove").on('click',this.removeFromLocal);
        $("#query").on('click',this.query);
        
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    receivedEvent: function(id) {
    	
        //$("#download_div").fadeIn("slow");
        var slideMenuButton = document.getElementById('slide-menu-button');
        slideMenuButton.onclick = function (e) {
            var cl = document.body.classList;
            if (cl.contains('left-nav')) {
                cl.remove('left-nav');
            } else {
                cl.add('left-nav');
            }
        };

        /*
        $.get("/howdoi/", function( data ) {
            console.log(data);
        });
        */


        function populateDB(tx) {
             tx.executeSql('DROP TABLE IF EXISTS DEMO');
             tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
             tx.executeSql('INSERT INTO DEMO (id, data) VALUES (5, "tercer row")');
             tx.executeSql('INSERT INTO DEMO (id, data) VALUES (6, "cuarto row")');
        }

        function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }

        function successCB() {
            alert("success!");
        }
        var db = window.openDatabase("HowdoiDB", "1.0", "Howdoi Database", 200000);
        db.transaction(populateDB, errorCB, successCB);
    },

    query: function(){
        function queryDB(tx) {
            tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
        }
        function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }

        function querySuccess(tx, results) {
            var len = results.rows.length;
            console.log("DEMO table: " + len + " rows found.");
            for (var i=0; i<len; i++){
                console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
            }

            // this will be empty since no rows were inserted.
            console.log(results);
            /*
            console.log("Insert ID = " + results.insertId);
            // this will be 0 since it is a select statement
            console.log("Rows Affected = " + results.rowAffected);
            // the number of rows returned by the select statement
            console.log("Insert ID = " + results.rows.length);
            console.log(" xxxxxxxxxxxxxxxxxxxx ");
            */
        }

        var db = window.openDatabase("HowdoiDB", "1.0", "Howdoi Database", 200000);
        db.transaction(queryDB, errorCB);
        console.log(" xxxxxxxxxxx after  query xxxxxxxxx ");
    },

    download: function(){
        console.log("start download");
        var downloadUrl = "http://192.168.1.40:8000/download/4/";
        var relativeFilePath = "MyDir/file_name.hwdi";
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
           var fileTransfer = new FileTransfer();
           fileTransfer.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                    $("#progress").html(perc + "%")
                    console.log(perc + "%")
                }
            };
           fileTransfer.download(
              downloadUrl,
              fileSystem.root.toURL() + '/' + relativeFilePath,

              function (entry) {
                 console.log("Success");
                 window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (fs){
                    zip.unzip(fileSystem.root.toURL() + '/' + relativeFilePath, fs.root.toURL() + '/MyDir', function(){
                        //success callback
                        console.log("FILE EXTRACTED");
                        $("#progress").html("Done!");
                    },function(progressEvent){
                        //progress callback
                        console.log("progressss");
                        $("#progress").html(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                    });
                 });
              },
              function (error) {
                console.log("Error during download. Code = " + error.code);
              }
           );
        });
    },

    checkIfExists: function(){
        $("#progress").html("check if exists");
        var relativeFilePath = "MyDir/file_name.hwdi";
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(relativeFilePath, { create: false }, function(fileEntry){
                 $("#progress").html("File " + fileEntry.fullPath + " exists!");
            }, function(){
                $("#progress").html("file does not exist");
            });
        }, function(evt){
            $("#progress").html(evt.target.error.code);
        });  
    },

    removeFromLocal: function(){
        $("#progress").html("remove file");
        var relativeFilePath = "MyDir/file_name.hwdi";
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(relativeFilePath, {create:false}, function(fileEntry){
                fileEntry.remove(function(file){
                    $("#progress").html("File removed!");
                },function(){
                    $("#progress").html("error deleting the file " + error.code);
                });
            },function(){
                $("#progress").html("file does not exist");
            });
        },function(evt){
            $("#progress").html(evt.target.error.code);
        });
    },
};
