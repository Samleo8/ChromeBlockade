var activateButton, fireAgainButton, activateNotif, saveNotif;
var notif_t = {};
var notifTimeout = 1000; //ms
var urlz;

var functions_activated=true;
var button_activated=true;
var blockade={};
//*
var blockade_default = {
	"facebook.com":{
		"div[data-click=home_icon]":{
			"name":"Facebook Home Button",
			"function":"remove"
		},
		"div[data-click=profile_icon]":{
			"name":"Facebook Profile Button",
			"function":"remove"
		},
		"#u_0_0":{
			"name":"Facebook Advertising",
			"function":"remove"	
		},
		"#u_0_h":{
			"name":"Facebook Searchbar",
			"function":"remove"
		},
		"._2gyi ._2gyj":{
			"name":"Facebook Button",
			"function":"remove"
		},
		"#stream_pagelet":{
			"name":"Facebook News Feed",
			"function":"remove"		
		},
        "*[data-click='bluebar_logo']":{
            "name":"Fb Button 2",
            "function":"remove"
        }
    }
};
//*/

//RETRIEVE DATA
retrieveOptions();

function init(){
    //RETRIEVE ELEMENTS
    activateButton = document.getElementById('ToggleActivateBtn');
    fireAgainButton = document.getElementById('FireAgainBtn');
    activateNotif = document.getElementById("activateNotif");
    saveNotif = document.getElementById("save_notif");

    notif_t[activateNotif] = null;
    notif_t[saveNotif] = null;
    
    //INIT ACTIVATE BUTTON
    if(functions_activated){
        activateButton.className = activateButton.className.replaceAll(" activate"," deactivate");
        activateButton.innerHTML = "DEACTIVATE";
        
        //IF POPUP BUTTON HAS BEEN DISABLED
        if(!button_activated){
            activateButton.className += " disabled";
            activateButton.disabled = true;
        }
    }
    else{
        activateButton.className = activateButton.className.replaceAll(" deactivate"," activate");
        activateButton.innerHTML = "ACTIVATE";
    }	
	
	//ACTIVATE BUTTON EVENT LISTENERS
    activateButton.addEventListener('click', function() {
        if(activateButton.className.indexOf(" deactivate")!=-1 && button_activated){
            activateButton.className = activateButton.className.replaceAll(" deactivate"," activate");
            activateButton.innerHTML = "ACTIVATE";
            functions_activated = false;
            
            displayNotif(activateNotif,"Deactivated!",600);
        }
        else if(activateButton.className.indexOf(" activate")!=-1){
            activateButton.className = activateButton.className.replaceAll(" activate"," deactivate");
            activateButton.innerHTML = "DEACTIVATE";
            functions_activated = true;
            
            if(!button_activated){
                activateButton.className += " disabled";
                activateButton.disabled = true;
            }
            
            displayNotif(activateNotif,"Activated!",600);
        }
        
        saveOptions();
    }, false);

    //FIRE AGAIN BUTTON EVENT LISTENERS
    fireAgainButton.addEventListener('click', function() {
        chrome.tabs.query({active: true,currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'BeginBlockade'}
            );
        });
    }, false);
    
	chrome.tabs.query({active: true,currentWindow:true}, function(tabs){
		var urlz = tabs[0]["url"];		
		var blockade = window.blockade;
		//console.log(blockade);
		
        //CHECK IF SITE IS ON HITLIST
		if(urlz!=null && blockade!=null) for(var i in blockade){
			if(!blockade.hasOwnProperty(i)) continue; 
					
			if(urlz.indexOf(i.toString())!=-1) {
				document.getElementById("underblockade").className = "";	
			}
		}
	});
}

function displayNotif(notif_obj, msg, time_out){
    clearTimeout(notif_t[notif_obj]);
    
    notif_obj.className = notif_obj.className.replaceAll(" disappear"," appear");
    
    if(time_out==null) time_out = notifTimeout;
    if(msg!=null) notif_obj.innerHTML = msg.toString();
    
    notif_t[notif_obj] = setTimeout(
        function(){
            notif_obj.className = notif_obj.className = notif_obj.className.replaceAll(" appear"," disappear");;
            clearTimeout(notif_t[notif_obj]);
        },time_out);
}

function retrieveOptions(){
    chrome.storage.sync.get(["functions_activated","button_activated","blockade_obj"],function(items){
		if(items["blockade_obj"]!=null) {
			blockade = JSON.parse(items["blockade_obj"]);
			
            if(functions_activated!=null) functions_activated = items["functions_activated"];
            else functions_activated = true;
            
            if(button_activated!=null) button_activated = items["button_activated"];
            else button_activated = true;
			
			init();
		}
		else{
			blockade = blockade_default;
			functions_activated = true;
            button_activated = true;
            
			init();
            saveOptions();
		}
		
	});
}

function saveOptions() {
    chrome.storage.sync.set({
        functions_activated: functions_activated,
        button_activated: button_activated,
        blockade_obj: JSON.stringify(blockade)
    },function(){		
        console.log("Options saved.");
    });
}

String.prototype.replaceAll = function(find,replace){
    return this.split(find).join(replace);
};