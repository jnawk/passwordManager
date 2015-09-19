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
    prepareProgressBar();
    pleaseWait('Loading, please wait...');

    var functions = [
	    prepareLoginForm, preparePasswordDetailsDialog,
	    prepareNewPasswordForm, prepareSetupHelpDialog, prepareUsersList,
	    prepareDeletePasswordConfirmDialog, prepareDeleteUserConfirmDialog,
	    prepareChangePasswordDialog, preparePasswordGenerator,
	    passwordListDialog
    ];

    var numFunc = functions.length;
    progressMax = numFunc + 2;
    progressIncr = 100 / progressMax;
    for ( var i = 0, progress = progressIncr; i < numFunc; ++i, progress = progressIncr
	    * (i + 1)) {
	functions[i]();
	$("#progressbar").progressbar({
	    value : progress
	});
    }
}

function preparePasswordGenerator() {
    var passwordGenerator = $('#passwordGenerator');
    passwordGenerator.dialog({
	autoOpen : false,
	modal : false,
	width : 500,
	maxWidth : 500,
	height : 450,
	open : openPasswordGenerator
    });

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

function passwordListDialog() {
    $('#passwords').dialog({
	autoOpen : false,
	modal : false,
	closeOnEscape : false,
	width : 600,
	height : 400,
	beforeClose : function(event, ui) {
	    loginToken = null;
	    restart();
	},
	open : function() {
	    if (admin) {
		$(this).dialog('option', 'buttons', {
		    "Change Password" : changePassword,
		    "Add Password" : newPassword,
		    "Password Generator" : passwordGenerator,
		    "List Users" : listUsers,
		    "Logout" : logout
		});
	    } else {
		$(this).dialog('option', 'buttons', {
		    "Change Password" : changePassword,
		    "Add Password" : newPassword,
		    "Password Generator" : passwordGenerator,
		    "Logout" : logout
		});
	    }
	    getPasswordList();
	}
    });
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

function prepareProgressBar() {
    $("#progressbar").progressbar({
	value : false
    });
    $('#loading').dialog({
	autoOpen : false,
	modal : true,
	dialogClass : "no-close",
	closeOnEscape : false,
	buttons : {}
    });
}

function prepareDeleteUserConfirmDialog() {
    var deleteUserSpan = $('#deleteUser');

    $('#deleteUserConfirm').dialog({
	autoOpen : false,
	modal : true,
	close : function() {
	    deleteUserSpan.attr('data-userId', '');
	    deleteUserSpan.text('');
	},
	buttons : {
	    "Ok" : function() {
		var userId = deleteUserSpan.attr('data-userId');
		deleteUser(userId);
	    },
	    "Cancel" : closeThisDialog
	}
    });
}

function prepareDeletePasswordConfirmDialog() {
    var deletePasswordSpan = $('#deletePassword');

    $('#deletePasswordConfirm').dialog({
	autoOpen : false,
	modal : true,
	close : function() {
	    deletePasswordSpan.attr('data-passwordId', '');
	    deletePasswordSpan.text('');
	},
	buttons : {
	    "Ok" : function() {
		var passwordId = deletePasswordSpan.attr('data-passwordId');
		deletePassword(passwordId);
	    },
	    "Cancel" : closeThisDialog
	}
    });
}

function preparePasswordDetailsDialog() {
    $('#passwordDetails').dialog({
	autoOpen : false,
	modal : true,
	width : 500,
	open : loadPasswordDetails,
	title: 'Loading...',
	close : function() {
	    $(this).dialog('option', 'title', 'Loading...');
	    $('#displayUsername').text('');
	    $('#displayPassword').text('');
	    $('#passwordDetailsTable').hide();
	}
    });
}

function prepareUsersList() {
    $('#userList').dialog({
	autoOpen : false,
	modal : false,
	open : getUserList,
	width : 400,
	height : 300,
	buttons : {
	    'Add new User' : createUser,
	    'Close' : closeThisDialog
	}
    });
}

function prepareLoginForm() {
    var loginForm = $('#loginForm');
    var username = loginForm.find('input[name="username"]');
    var password = loginForm.find('input[name="password"]');

    loginForm.dialog({
	autoOpen : false,
	modal : true,
	closeOnEscape : false,
	dialogClass : 'no-close',
	buttons : [
	    {
		id : 'loginButton',
		text : "Login",
		click : function() {
		    pleaseWait('Loading, please wait...');
		    $("#progressbar").progressbar({
			value : false
		    });
		    postLogin(username.val(), password.val());
		}
	    }
	],
	close : function() {
	    username.val('');
	    password.val('');
	    $('body').unbind('keyup');
	},
	open : function() {
	    $('body').bind('keyup', function(event) {
		if (event.keyCode == $.ui.keyCode.ENTER) {
		    event.stopPropagation();
		    $('#loginButton').click();
		}
	    });
	}
    });
}

function prepareSetupHelpDialog() {
    $('#setupHelp').dialog({
	autoOpen : false,
	modal : true,
	width : 450,
	buttons : {
	    'Ok' : closeThisDialog
	},
	beforeClose : function() {
	    restart();
	}
    });
}

function prepareNewPasswordForm() {
    var newPasswordForm = $('#newPasswordForm');
    var username = newPasswordForm.find('input[name="username"]');
    var password = newPasswordForm.find('input[name="password"]');
    var description = newPasswordForm.find('input[name="description"]');

    newPasswordForm.dialog({
	autoOpen : false,
	modal : true,
	close : function() {
	    description.val("");
	    username.val("");
	    password.val("");
	},
	buttons : {
	    "Add Password" : function() {
		addPassword(description.val(), username.val(), password.val());
	    },
	    "Cancel" : closeThisDialog,
	    "Password generator" : passwordGenerator
	}
    });
}
