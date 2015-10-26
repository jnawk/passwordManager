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

function validatePassword(password, password2) {
    console.log('validating password');
    if(password != password2) {
	return false;
    }
    // TODO more checks here
    return true;
}

function processLogin(data) {
    console.log('processLogin()');
    if(data.errorMessage) {
	console.log('login failure');
	console.log(data.errorMessage);
	return;
    } 
    if(data.token) {
	localStorage.setItem('token', data.token);
	console.log('navigating to #passwords');
	$('body').pagecontainer('change', '#passwords');
    }
}

$( function(){ 
    console.log("$ handler running");

    $('#login').on('pagecreate', function() {
	console.log('login page created');
	$('#loginButton').click(function(event){
	    console.log('login button');
	    var username = $('#loginForm input[name="username"]').val();
	    var password = $('#loginForm input[name="password"]').val();
	    $.ajax({
		type: 'POST',
		url: contextRoot + '/login',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
		    username: username,
		    password: password
		}),
		success: function(data, textStatus, jqXHR){
		    console.log('login button success');
		    processLogin(data);
		}
	    });
	    event.preventDefault();
	    event.stopPropagation();	  
	});	

	$('#newUser').click(function(){
	    console.log('new user button');
	    $('#loginButtonContainer').hide();
	    $('#newUserContainer').hide();
	    $('#newUserPasswordContainer').show();
	});
    
	$('#signup').click(function(){
	    $('signup button');
	    var username = $('#loginForm input[name="username"]').val();
	    var password = $('#loginForm input[name="password"]').val();
	    var password2 = $('#loginForm input[name="password2"]').val();
	    
	    if(!validatePassword(password, password2)) {
		console.log('problem with passwords');
		return;
	    }
	    
	    $.ajax({
		type: 'POST',
		url: contextRoot + '/signup',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
		    username: username,
		    password: password
		}),
		success: function(data, textStatus, jqXHR){
		    console.log('signup button success');
		    processLogin(data);
		}
	    });
	});
    });

    $('#login').on('pageshow', function(event){
	console.log('login pageshow');
	if('undefined' ==typeof localStorage.token) {
	    console.log('null token showing login page');
	} else {
	    $('body').pagecontainer('change', '#passwords');
	    return;
	}

	$('#loginForm').hide();	
	$('#loginForm-pleaseWait').show();
	$.ajax({
	    type: 'GET',
	    url: contextRoot + '/accepting-new-members',
	    dataType: 'json',
	    success: function(data, textStatus, jqXHR) {
		console.log('get new user success');
		$('#loginForm-pleaseWait').hide();
		$('#loginForm').show();
		if(data) {
		    $('#newUserContainer').show();
		}
	    }
	});	    
    });

    $('#passwords').on('pagecreate', function() {
	console.log('passwords page created');
    });

    $('#passwords').on('pageshow', function(){
	console.log('displayPasswords()');
	if('undefined' == typeof localStorage.token) {
	    console.log('not logged in');
	    $('body').pagecontainer('change', '#login');
	    return;
	}
	$.ajax({
	    type: 'POST',
	    url: contextRoot + '/getPasswords',
	    dataType: 'json',
	    contentType: 'application/json',
	    data: JSON.stringify({
		token: localStorage.token
	    }),
	    success: function(data, textStatus, jqXHR){
		// add the passwords to the table
		console.log('getPassword success');
		console.log(JSON.stringify(data));
	    }
	});
    });

    $('#landing').on('pageshow', function(){
	if('undefined' ==typeof localStorage.token) {
	    console.log('null token showing login page');
	    $('body').pagecontainer('change', '#login');
	} else {
	    $('body').pagecontainer('change', '#passwords');
	}
    });
});
