var activateButton, activateNotif, saveNotif, errorNotif, popupDeactivateCheckbox;
var notif_t = {};
var notifTimeout = 1000; //ms

var functions_activated = true;
var button_activated = true;
var hardblock = false;

/* BLOCKADE FUNCTIONS:
 * BLOCKADE: Total Blockade of Page
 * hide: Hides Element from User & Makes it Inaccessible 
 * hide_opacity: Hides Element from User, but still clickable
 * remove: Totally Removes Element. User doesn't stand a chance.
*/
var blockade_functions = ["remove","hide","hide_opacity"];
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

document.addEventListener('DOMContentLoaded', function() {
    //RETRIEVE DATA
    retrieveOptions();
	
	//INITIATION STARTS ONCE OPTIONS ARE RETRIVED.
}, false);

function init(){
    //RETRIEVE ELEMENTS
    activateButton = document.getElementById('ToggleActivateBtn');
    popupDeactivateCheckbox = document.getElementById("disablePopupBtnCheckbox");
    activateNotif = document.getElementById("activateButtonHolder").getElementsByTagName("span")[0];
    saveNotif = document.getElementById("save_notif");
    errorNotif = document.getElementById("error_notif");
    
    notif_t[activateNotif] = null;
    notif_t[saveNotif] = null;
	notif_t[errorNotif] = null;
    
    //INIT ACTIVATE BUTTON
    if(functions_activated){
        activateButton.className = activateButton.className.replaceAll(" activate"," deactivate");
        activateButton.innerHTML = "DEACTIVATE";
    }
    else{
        activateButton.className = activateButton.className.replaceAll(" deactivate"," activate");
        activateButton.innerHTML = "ACTIVATE";
    }
	
	//ACTIVATE BUTTON EVENT LISTENERS
    activateButton.addEventListener('click', function() {
        if(activateButton.className.indexOf(" deactivate")!=-1){
            activateButton.className = activateButton.className.replaceAll(" deactivate"," activate");
            activateButton.innerHTML = "ACTIVATE";
            functions_activated = false;
            
            displayNotif(activateNotif,"Deactivated!",600);
        }
        else if(activateButton.className.indexOf(" activate")!=-1){
            activateButton.className = activateButton.className.replaceAll(" activate"," deactivate");
            activateButton.innerHTML = "DEACTIVATE";
            functions_activated = true;
            
            displayNotif(activateNotif,"Activated!",600);
        }
        
        saveOptions();
    }, false);
		
    //INIT POPUP DEACTIVATION CHECKBOX
    popupDeactivateCheckbox.checked = !button_activated;
    
    //CHECKBOX EVENT LISTENERS
    popupDeactivateCheckbox.addEventListener('change', function() {
        button_activated = !popupDeactivateCheckbox.checked;
        
        saveOptions();
    }, false);
    
	//DISPLAY CURRENT TARGETS
	displayCurrentTargets();
	
	//ADD BUTTON LISTENERS FOR HITLIST ADDING INPUT
	var modalBoxAdd = document.querySelectorAll(".modal .modal_box .button_holder .button.activate")[0];
	var modalBoxCancel = document.querySelectorAll(".modal .modal_box .button_holder .button.deactivate")[0];
	
	modalBoxAdd.addEventListener('click', function() {
		var modalBox = this.parentNode.parentNode;
		var hitlistType = modalBox.getAttribute("data-hitlist-type");
		confirmAddToHitlist(hitlistType,modalBox);
	}, false);	
	
	modalBoxCancel.addEventListener('click', function() {
		toggleAppearance(this.parentNode.parentNode.parentNode);
	}, false);
	
	//Hardblock (ie prevent deactivation completely)
	if(hardblock){
		x = document.getElementById("activateButtonHolder");
		x.parentNode.removeChild(x);
		
		if(button_activated){button_activated = false; saveOptions(); }
	}
}

function confirmAddToHitlist(type,modalBox){
	if(type==null){
		modalBox = document.querySelectorAll(".modal .modal_box")[0];
		type = modalBox.getAttribute("data-hitlist-type");
	}
	
	var modalInputs = modalBox.getElementsByClassName("modal_inputs")[0];
	if(type == "site"){
		var v = modalInputs.getElementsByTagName("input")[0].value;
		if(v.length<=0){
			displayNotif(errorNotif,"URL cannot be empty!",700);
			return;
		}
		if(v.indexOf(".")==-1){
			displayNotif(errorNotif,"Invalid URL!",700);
			return;
		}
		blockade[v.toString()] = {};
	}
	else if(type == "indv"){
		var nm = modalInputs.getElementsByTagName("input")[0].value.toString();
		var sel = modalInputs.getElementsByTagName("input")[1].value.toString();
		var e = modalInputs.getElementsByTagName("select")[0];
		var fn = e.options[e.selectedIndex].text;
		var site = modalBox.getElementsByTagName("h2")[0].getElementsByTagName("span")[0].innerHTML;

		console.log(nm);
		if(nm.length<=0){
			console.log(errorNotif);
			displayNotif(errorNotif,"Name field cannot be blank!",700);
			return;
		}
		if(sel.length<=0){
			displayNotif(errorNotif,"Selector field cannot be blank!",700);
			return;
		}
		
		blockade[site][sel] = {"name":nm, "function":fn};		
	}
	
	saveOptions();
	toggleAppearance(modalBox.parentNode);
	displayCurrentTargets();		
}

function hitlistAdd(type, site){	
	var modal = document.getElementsByClassName("modal")[0];
	toggleAppearance(modal);
	
	var modalBox = document.getElementsByClassName("modal")[0].getElementsByClassName("modal_box")[0];
	var modalTitle = modalBox.getElementsByTagName("h1")[0];
	var modalSubtitle = modalBox.getElementsByTagName("h2")[0].getElementsByTagName("span")[0];
	var modalInputs = modalBox.getElementsByClassName("modal_inputs")[0];
		
	modalBox.setAttribute("data-hitlist-type",type);
	
	if(type=="site"){
		modalTitle.innerHTML = "Add New Site to Hitlist";
		modalSubtitle.innerHTML = "";
		modalInputs.innerHTML = '<input type="url" class="full_width" />';
	}
	else if(type=="indv"){
		modalTitle.innerHTML = "Add New Selector to Hitlist";
		modalSubtitle.innerHTML = site;
		
		var out = '';
        out+="<table class='hitlist disableSelect'>";   
		out+="<tr><td>Name</td><td>Selector</td><td>Function</td></tr>";
		out+="<tr>";
		for(var j=0;j<2;j++) out+="<td><input type='text' class='part_width' /></td>";
		out+="<td><select>";
		for(var j=0;j<blockade_functions.length;j++)
			out+="<option>"+blockade_functions[j]+"</option>";
		out+="</select></td>";
        out+="</table>";
		
		modalInputs.innerHTML = out;
	}
	
	var modalInputBoxes = modalInputs.getElementsByTagName("input");
	for(var i=0;i<modalInputBoxes.length;i++){
		modalInputBoxes[i].removeEventListener('keyup', boxInputEnter, false);	
		modalInputBoxes[i].addEventListener('keyup', boxInputEnter, false);	
	}
}

function toggleAppearance(obj){
	if(obj.className.indexOf(" disappear")!=-1){
		obj.className = obj.className.replaceAll(" disappear"," appear");
	}
	else if(obj.className.indexOf(" appear")!=-1){
		obj.className = obj.className.replaceAll(" appear"," disappear");
	}
}

function displayCurrentTargets(){
    var outputEle = document.getElementById("hitlist_holder");
	if(outputEle == null) return;
	
    var out = '';
    
    for(var i in blockade){
		if(!blockade.hasOwnProperty(i)) continue; 
				
        out += "<h3 data-site-name='"+i+"'>"+i+" <div class='icon-add disableSelect'></div> <div class='icon-remove disableSelect'></div></h3>";
        out+="<table class='hitlist disableSelect'>";
        
		if(blockade[i] == "BLOCKADE"){
			out+="<tr><td>TOTAL BLOCKADE!</td><td><div class='icon-remove hitlist_remove'></div></td></tr></table>";
            continue;
		}
        
		out+="<tr><td>Name</td><td>Selector</td><td>Function</td><td></td></tr>";
        
		for(var j in blockade[i]){
			if(!blockade[i].hasOwnProperty(j)) continue; 
			
            out+="<tr data-site-name='"+i+"' data-selector='"+j+"'>";
            
            out+="<td>"+blockade[i][j]["name"]+"</td>";
			out+="<td class='enableSelect'>"+j.toString()+"</td>";
            out+="<td>"
            var fn = blockade[i][j]["function"];
            if(typeof fn === "function") out+="<i>Custom</i>";
            else if(typeof fn == "string"){
                out+=fn;
		}
            out+="</td>";
            
            out+="<td><div class='icon-remove hitlist_remove'></div></td></tr>";
		}
        
        out+="</table>";
	}
    
    outputEle.innerHTML = out;
	
	//ADD BUTTON LISTENERS FOR CURRENT TARGETS BUTTONS
	//Adding a new site
	var siteAddBtn = document.querySelectorAll("h2 .icon-add")[0];
	var siteRemBtns = document.querySelectorAll("h3 .icon-remove");
	
	//Adding individual blockades
	var indvAddBtns = document.querySelectorAll("h3 .icon-add");
	var indvRemBtns = document.querySelectorAll("td .icon-remove");
	
	siteAddBtn.removeEventListener('click', siteAddBtnE, false);	
	siteAddBtn.addEventListener('click', siteAddBtnE, false);	
	
	for(var i=0;i<siteRemBtns.length;i++){
		siteRemBtns[i].addEventListener('click', function() {
			var r = confirm("Are you sure you want to remove this site from the hitlist? This action CANNOT be undone!");
			if(!r) return;
			
			//Remove site from hitlist
			var site=this.parentNode.getAttribute("data-site-name");
			delete blockade[site];
			
			displayCurrentTargets();
			saveOptions();		
		}, false);
	}
	
	for(var i=0;i<indvAddBtns.length;i++){
		indvAddBtns[i].removeEventListener('click', indvAddBtnE, false);
		indvAddBtns[i].addEventListener('click', indvAddBtnE, false);
	}
	
	for(var i=0;i<indvRemBtns.length;i++){
		indvRemBtns[i].addEventListener('click', function() {
			var r = confirm("Are you sure you want to remove this site from the hitlist? This action CANNOT be undone!");
			if(!r) return;
			
			//Remove site from hitlist
			var site=this.parentNode.parentNode.getAttribute("data-site-name");
			var sel=this.parentNode.parentNode.getAttribute("data-selector");
			
			if(sel!=null) delete blockade[site][sel];
			else blockade[site] = {}; //for cases of total blockade
			
			displayCurrentTargets();
			saveOptions();
		}, false);
	}
}

//Event Listener Functions -- Needed to allow for removeEventListener
	var siteAddBtnE = function() {
		hitlistAdd("site");
	}
	
	var indvAddBtnE = function(e) {
		//Remove site from hitlist
		var site=this.parentNode.getAttribute("data-site-name");

		hitlistAdd("indv",site);
	}
	
	var boxInputEnter = function(event){
		if(event.keyCode == 13){
			var modalBox = this.parentNode.parentNode;
			var hitlistType = modalBox.getAttribute("data-hitlist-type");
			confirmAddToHitlist(hitlistType,modalBox);
		}	
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
		if(items["blockade_obj"]==null || items["blockade_obj"]=="{}"){
			blockade = blockade_default;
			functions_activated = true;
            button_activated = true;
            
			init(); saveOptions();
		}
		else{
			blockade = JSON.parse(items["blockade_obj"]);
			
            if(functions_activated!=null) functions_activated = items["functions_activated"];
            else functions_activated = true;
            
            if(button_activated!=null) button_activated = items["button_activated"];
            else button_activated = true;
            
			init();
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