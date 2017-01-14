$(document).ready(function() {
    init();
});

// State
var selected = null;
var appList = null;
var appValues = null;
var appitem_template = $('#appitem').html();
var configitem_template = $('#configitem').html();

// Initialization on document ready
function init() {
    // Ensures DOM for inputs and display is clean
    cleanEntries();
    // Precompile mustache templates
    Mustache.parse(appitem_template);  
    Mustache.parse(configitem_template);   
	// Fills the left sidebar with application list
    ensureAppList();
    ensureAppValues();
    showHideSelected();

    $("#newapp-name").on('keyup', function (e) {
        if ( e.keyCode === 13 ) {
        	addApplication();
        }
    })
}

function showHideSelected() {
	if ( selected ) {
    	$('.config-content').css("display", "block");
    	$('#btn-remove').prop("disabled", false);
    } else {
    	$('.config-content').css("display", "none");
    	$('#btn-remove').prop("disabled", true);
    }
}

function cleanEntries() {
    $('#newapp-name').val('');
    $('#newkey').val('');
    $('#newval').val('');	
}

function ensureAppList() {
    if ( !appList ) {  
	    $.getJSON('/api/list', function(response) {
	    	appList = response;
	    	populateAppList();  
	    });
	} else {
		// Does a refresh if only selection changed
		populateAppList();
	}
}

function populateAppList() {
	$('#select_application').empty();	
    // check if there are no applications
	if ( !appList || appList.applications.length === 0 ) {
		var element = $('<p>', {
			style: "text-decoration: underline;",
			text: "No applications found.  Please create at least one application."
		}).appendTo('#select_application');		
		selected = '';
        showHideSelected();
		clearAll();
		return;
	}
    // Populate the sidebar
    var rendered = Mustache.render(appitem_template, 
    	{appname: selected ? selected : 'Choose One', 
    	 applist: appList.applications});
	$('#select_application').append(rendered);	
}

function ensureAppValues() {
    if ( selected && !appValues ) {  
	    $.getJSON('/api/getall/' + selected, function(response) {
	    	appValues = response;
	    	populateAppValues();  
	    });
	} else {
		// Does a refresh if only items changed
		populateAppValues();
	}
}

function populateAppValues() {
	$('#config-content-table').empty();
	if ( selected === '' ) return;
	if ( !appValues || appValues.values.length === 0 ) {
		var element = $('<p>', {
			text: "No parameters found."
		}).appendTo('#config-content-table');
		return;
	}
	var itemlist = [];
	$.each(appValues.values, function(i, val) {
        itemlist.push({keyname: val.key, value: val.value, i: i });
	});
    var rendered = Mustache.render(configitem_template, {itemlist: itemlist, appname: selected});
    $('#config-content-table').append(rendered);	
}

function setSelected(app) {
	if ( app === selected ) return;
	selected = app;	
	appValues = null;
    ensureAppList();    
    ensureAppValues();    
    cleanEntries();
    showHideSelected();
    $('#config-title-app').empty();
    $('#config-title-app').append(app);
}

function setItem(app, key, i) {
	var value = $('#value_input_'+i).val();
	$.post({
		url:'/api/set/'+app+'/'+key, 
		data: {value: value}, 
		success: function() {
			appValues = null;
			ensureAppValues();
		}
	});
}

function addApplication() {
    var appName = $('#newapp-name').val();
    if ( !appName ) return;
    appList = null;
    cleanEntries();
    $.ajax({
    	url: '/api/add/'+appName, 
    	method: 'PUT',
    	success: function() {
            setSelected(appName);
        }
    });
}

function removeSelectedApplication() {
	var appName = selected;
    if ( !appName ) return;
	var proceed = window.confirm("Are you sure you want to delete the application " + selected);
    if ( !proceed ) return;
    appList = null;
    $.ajax({
    	url: '/api/delete/'+appName, 
    	method: 'DELETE',
    	success: function() {
            setSelected('');
    	}
    });
    $('#newapp-name').val('');
}

function removeItem(key) {
	var appName = selected;
    if ( !appName ) return;
    appValues = null;
    $.ajax({
    	url: '/api/delete/'+appName+'/'+key, 
    	method: 'DELETE',
    	success: function() {
            ensureAppValues();
    	}
    });
}

function addNewKeyValue() {
    var appName = selected;
    if ( !appName ) return;
    var key = $('#newkey').val();
    var val = $('#newval').val();
    appValues = null;
    $.post({
    	url: '/api/set/'+appName+'/'+key, 
    	data: {value: val},
    	success: function() {
    		ensureAppValues();
    	}
    });
    $('#newkey').val('');
    $('#newval').val('');
}
