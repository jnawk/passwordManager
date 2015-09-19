/*
 * #%L
 * Password Manager
 * %%
 * Copyright (C) 2013 BAF Technologies Limited
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
var loginToken;
var admin;
var progressIncr;
var progressMax;

$(function() {
    $('#passwordTable').dataTable({
	"aaSorting" : [
	    [
		    0, "asc"
	    ]
	],
	"aoColumns" : [
		null, null, null
	]
    });
    go();
});

function restart() {
    $('.hidden').hide();
    go();
}

function go() {
    loadResources();
    // need to figure out if the application is setup
    $.ajax({
	type : 'GET',
	url : 'json/anonymous/isSetup',
	dataType : 'json',
	success : function(data, textStatus, jqXHR) {
	    if (data.setup) {
		// application is setup - is there a user?
		$("#progressbar").progressbar({
		    value : progressIncr * (progressMax - 1)
		});

		$.ajax({
		    type : 'GET',
		    url : 'json/anonymous/isUserSetup',
		    dataType : 'json',
		    success : function(data, textStatus, jqXHR) {
			waitingDone();
			if (data.setup) {
			    // there is a user, let's login
			    login();
			} else {
			    // there is no user, let's create one
			    createFirstUser();
			}
		    }
		});
	    } else {
		// application is not setup, display setup help
		setupHelp(data.errors, data.dbLocation);
	    }
	}
    });
}

function pleaseWait(message) {
    $('#progressbar').progressbar('option', 'value', false);
    $('#loading').dialog('open');
    $('#pleaseWaitMessage').text(message);
}

function waitingDone() {
    $("#loading").dialog('close');
}

function showErrors(form, errors) {
    var errorsList = form.find('ul.errors');
    for ( var i = 0; i < errors.length; ++i) {
	errorsList.append("<li>").text(errors[i]);
    }
    errorsList.show();
}

function setupHelp(errors, dbLocation) {
    waitingDone();
    var problems = $('#problems');
    problems.empty();
    $('#dbLocation').text(dbLocation);
    for ( var i = 0; i < errors.length; ++i) {
	problems.append('<li>' + errors[i] + '</li>');
    }
    $('#setupHelp').dialog('open');
}

function closeThisDialog() {
    $(this).dialog('close');
}
