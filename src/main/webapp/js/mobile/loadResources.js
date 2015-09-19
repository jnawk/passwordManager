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
function loadResources() {
    var functions = [
	    prepareLoginForm, preparePasswordDetailsDialog, prepareNewPasswordForm,  
	    prepareDeletePasswordConfirmDialog, prepareChangePasswordDialog, 
	    preparePasswordGenerator, preparePasswordListForm	    
    ];

    var numFunc = functions.length;
    for ( var i = 0; i < numFunc; ++i) {
	functions[i]();
    }
    $('.hidden').hide();
}

function preparePasswordGenerator() {
    var passwordGenerator = $('#passwordGenerator');
//    passwordGenerator.dialog({
//	autoOpen : false,
//	modal : false,
//	width : 500,
//	maxWidth : 500,
//	height : 450,
//	open : openPasswordGenerator
//    });

    var passwordLength = passwordGenerator.find('input[name="passwordLength"]');
    passwordLength.spinner({
	min : 0,
	change : function(event, ui) {
	    changePasswordLength(passwordLength.val());
	},
	spin : function(event, ui) {
	    changePasswordLength(ui.value);
	}
    });
}

function preparePasswordListForm() {
    $('#passwordTable').dataTable({
	columns : [
		{
		    data : 'description'
		}, {
		    data : null,
		    render : function(data, type, row, meta) {
			if (type === 'display') {
			    return '<span class="showPassword" data-passwordId="' + row.id + '">Show Details</span>';			    
			} 
			return null;
		    }
		}, {
		    data : null,
		    render : function(data, type, row, meta) {
			if (type === 'display') {
			    return '<span class="showPassword" data-passwordId="' + row.id + '" data-description="' + row.description + '">Show Details</span>';
			} 
			return null;
		    }
		}
	]
    });
    
    $('#changePasswordButton').button();
    $('#addPasswordButton').button();
    $('#passwordGeneratorButton').button();
    $('#logoutButton').button();
    
    $('#changePasswordButton').click(changePassword);
    $('#addPasswordButton').click(newPassword);
    $('#passwordGeneratorButton').click(passwordGenerator);
    $('#logoutButton').click(logout);   
}

function prepareChangePasswordDialog() {
    var changePassword = $('#changePassword');
    var oldPassword = changePassword.find('input[name="oldPassword"]');
    var newPassword1 = changePassword.find('input[name="newPassword1"]');
    var newPassword2 = changePassword.find('input[name="newPassword2"]');

    changePassword.dialog({
	autoOpen : false,
	modal : true,
	open : function() {
	    changePassword.find('ul.errors').empty().hide();
	},
	close : function() {
	    oldPassword.val('');
	    newPassword1.val('');
	    newPassword2.val('');
	},
	buttons : {
	    "Change password" : function() {
		if (newPassword1.val() != newPassword2.val()) {
		    showErrors(changePassword, [
			"Passwords aren't the same"
		    ]);
		} else {
		    doChangePassword(oldPassword.val(), newPassword1.val());
		}
	    },
	    "Cancel" : function() {
		changePassword.dialog('close');
	    }
	}
    });
}

function prepareDeletePasswordConfirmDialog() {
    var deletePasswordSpan = $('#deletePassword');

    $('#deletePasswordYes').button();
    $('#deletePasswordNo').button();
    
    $('#deletePasswordYes').click(function() {
	var passwordId = deletePasswordSpan.attr('data-passwordId');
	deletePassword(passwordId);
	window.history.back();
    });
    $('#deletePasswordNo').click(function() {
	    deletePasswordSpan.attr('data-passwordId', '');
	    deletePasswordSpan.text('');
	    window.history.back();
    });     
}

function preparePasswordDetailsDialog() {
    $('#passwordDetailsClose').button();
    $('#passwordDetailsEdit').button();

    $('#passwordDetailsClose').click(function() {
	window.history.back();
	$('#displayUsername').text('');
	$('#displayPassword').text('');
	$('#passwordDetailsTable').hide();
    });
    $('#passwordDetailsEdit').click(passwordDetailsEdit);
}

function prepareLoginForm() {
    var loginForm = $('#loginForm');
    var username = loginForm.find('input[name="username"]');
    var password = loginForm.find('input[name="password"]');
    
    $('#loginButton').button();
    $('#loginButton').click(function() {	    
	    $('body').unbind('keyup');
	    postLogin(username.val(), password.val());
	});
    
    $('body').bind('keyup', function(event) {
	if (event.keyCode == $.ui.keyCode.ENTER) {
	    event.stopPropagation();
	    $('#loginButton').click();
	}
    });      
}

function prepareNewPasswordForm() {
    var newPasswordForm = $('#newPasswordForm');
    var username = newPasswordForm.find('input[name="username"]');
    var password = newPasswordForm.find('input[name="password"]');
    var description = newPasswordForm.find('input[name="description"]');

    $('#addNewPasswordButton').button();
    $('#cancelNewPasswordButton').button();
    $('#newPasswordGeneratorButton').button();
    $('#addNewPasswordButton').click(function() {
	addPassword(description.val(), username.val(), password.val());
    });
    $('#cancelNewPasswordButton').click(function() {
	window.history.back();
    });
    $('#newPasswordGeneratorButton').click(passwordGenerator);
    
}
