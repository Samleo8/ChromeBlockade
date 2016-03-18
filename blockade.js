var blockade = {};
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
		}
	}
}; 

var functions_activated = true;

retrieveOptions();

function retrieveOptions(){
    chrome.storage.sync.get(["functions_activated","blockade_obj"],function(items){
		if(items["blockade_obj"]==null || items["blockade_obj"]=="{}"){
			blockade = blockade_default;
			functions_activated = true;		
			beginBlockade();
			console.log("Default blockade loaded!");
			saveOptions();	
		}
		else{
			blockade = JSON.parse(items["blockade_obj"]);
			functions_activated = items["functions_activated"];
		}
		
		if(functions_activated){
			beginBlockade();
			console.log("Blockade Activated!");
		} else console.log("Blockade Deactivated!");
	});
}


function saveOptions() {
    chrome.storage.sync.set({
        functions_activated: functions_activated,
        blockade_obj: JSON.stringify(blockade)
    },function(){		
        console.log("Default loaded and saved.");
    });
}

/* BLOCKADE FUNCTIONS:
 * BLOCKADE: Total Blockade of Page
 * hide: Hides Element from User & Makes it Inaccessible 
 * hide_opacity: Hides Element from User, but still clickable
 * remove: Totally Removes Element. User doesn't even stand a chance.
*/

//*
function beginBlockade(){
	for(var i in blockade){
		if(!blockade.hasOwnProperty(i)) continue; 
		
		if(window.location.href.indexOf(i.toString())==-1) continue;
				
		if(blockade[i] == "BLOCKADE"){
			document.body.innerHTML = "";
			continue;
		}
		
		for(var j in blockade[i]){
			if(!blockade[i].hasOwnProperty(j)) continue; 
			
			var elements = document.querySelectorAll(j.toString());	
			for(var k=0;k<elements.length;k++){
				var fn = blockade[i][j]["function"];
				if(typeof fn === "function") blockade[i][j]["function"]();
				else if(typeof fn == "string"){
					if(fn == "hide"){
						elements[k].style.display = "none";
					}
					else if(fn == "remove"){
						elements[k].parentNode.removeChild(elements[k]);
					}
					else if(fn == "hide_opacity"){
						elements[k].style.opacity = 0;
					}
				}
			}
		}
	}
}
//*/