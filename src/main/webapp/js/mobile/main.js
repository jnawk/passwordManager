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

$(function() {
    go();
});

function restart() {
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

		$.ajax({
		    type : 'GET',
		    url : 'json/anonymous/isUserSetup',
		    dataType : 'json',
		    success : function(data, textStatus, jqXHR) {
			if (data.setup) {
			    // there is a user, let's login
			    login();
			} else {			    
			    // TODO something here..
			}
		    }
		});
	    } else {
		// TODO something here.		
	    }
	}
    });
}

function showErrors(form, errors) {
    var errorsList = form.find('ul.errors');
    for ( var i = 0; i < errors.length; ++i) {
	errorsList.append("<li>").text(errors[i]);
    }
    errorsList.show();
}
