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

var token;

function validatePassword(password, password2) {
    if(password != password2) {
	return false;
    }
    // TODO more checks here
    return true;
}

function displayPasswords() {
    $.mobile.navigate('#passwords');
}

$(function() {
    $.ajax({
	type: 'GET',
	url: contextRoot + '/accepting-new-members',
	dataType: 'json',
	success: function(data, textStatus, jqXHR) {
	    $('#loginForm-pleaseWait').hide();
	    $('#loginForm').show();
	    if(data) {
		$('#newUserContainer').show();
	    }
	}
    });

    $('#newUser').click(function(){
	$('#loginButtonContainer').hide();
	$('#newUserContainer').hide();
	$('#newUserPasswordContainer').show();
    });

    $('#signup').click(function(){
	var username = $('#loginForm input[name="username"]').val();
	var password = $('#loginForm input[name="password"]').val();
	var password2 = $('#loginForm input[name="password2"]').val();

	if(!validatePassword(password, password2)) {
	    console.log('problem with passwords');
	    return;
	}

	$.ajax({
	    type: 'POST',
	    url: contextRoot,
	    dataType: 'json',
	    contentType: 'application/json',
	    data: JSON.stringify({
		operation: 'signup',
		username: username,
		password: password
	    }),
	    success: function(data, textStatus, jqXHR){
		console.log(JSON.stringify(data));
		// TODO extract token
		displayPasswords();
	    }
	});
    });
});

