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
function newPassword() {
    $('#newPasswordForm').dialog("open");
}

function changePassword() {
    $('#changePassword').dialog('open');
}

function doChangePassword(oldPassword, newPassword) {
    pleaseWait('Changing password, please wait...');
    $.ajax({
	type : 'POST',
	url : 'json/changePassword',
	username : loginToken.username,
	password : loginToken.password,
	data : JSON.stringify({
	    username : loginToken.username,
	    password : newPassword,
	    oldPassword : oldPassword
	}),
	contentType : 'application/json',
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    waitingDone();
	    if (data.errors.length > 0) {
		showErrors($('#changePassword'), data.errors);
	    } else {
		$('#changePassword').dialog('close');
		loginToken = data.loginToken;
	    }
	}
    });
}

function loadPasswordDetails() {
    var passwordDetails = $('#passwordDetails');
    var progress = $('#passwordDetailsLoadProgress');
    progress.progressbar({
	value : false,
    });
    progress.show();
    var passwordId = passwordDetails.attr('data-passwordId');
    $.ajax({
	type : 'POST',
	url : 'json/getPasswordDetails',
	username : loginToken.username,
	password : loginToken.password,
	data : JSON.stringify({
	    passwordId : passwordId
	}),
	contentType : 'application/json',
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    progress.hide();
	    var description = data.details.description;
	    $('#displayUsername').text(data.details.username);
	    $('#displayPassword').text(data.details.password);
	    passwordDetails.attr('data-description', description);
	    passwordDetails.dialog('option', 'title', 'Password Details - '
		    + passwordDetails.attr('data-description'));
	    passwordDetails.dialog('option', 'buttons', {
		'Edit' : passwordDetailsEdit,
		'Close' : closePasswordDetails
	    });
	    $('#editPassword').hide();
	    $('#passwordDetailsTable').show();
	}
    });
}

function showPasswordDetails() {
    var passwordId = $(this).attr('data-passwordId');
    var passwordDetails = $('#passwordDetails');
    passwordDetails.attr('data-passwordId', passwordId);
    passwordDetails.dialog("open");
}

function closePasswordDetails() {
    $('#passwordDetails').dialog("close");
}

function passwordDetailsEdit() {
    var passwordDetails = $('#passwordDetails');
    var editPassword = $('#editPassword');
    passwordDetails.dialog('option', 'buttons', {
	'Password Generator' : passwordGenerator,
	'Save' : passwordDetailsSave,
	'Cancel' : passwordViewMode,
	'Close' : closePasswordDetails
    });
    editPassword.find('input[name="description"]').val(
	    passwordDetails.attr('data-description'));
    editPassword.find('input[name="username"]').val(
	    $('#displayUsername').text());
    editPassword.find('input[name="password"]').val(
	    $('#displayPassword').text());
    editPassword.show();
    $('#passwordDetailsTable').hide();
}

function passwordViewMode() {
    $('#passwordDetails').dialog('option', 'buttons', {
	'Edit' : passwordDetailsEdit,
	'Close' : closePasswordDetails
    });
    $('#passwordDetailsTable').show();
    $('#editPassword').hide();
}

function passwordDetailsSave() {
    var passwordDetails = $('#passwordDetails');
    var editPassword = $('#editPassword');
    var description = editPassword.find('input[name="description"]').val();
    var username = editPassword.find('input[name="username"]').val();
    var password = editPassword.find('input[name="password"]').val();
    var passwordId = passwordDetails.attr('data-passwordId');
    pleaseWait('Updating password, please wait...');
    $.ajax({
	type : 'POST',
	url : 'json/updatePassword',
	username : loginToken.username,
	password : loginToken.password,
	data : JSON.stringify({
	    id : passwordId,
	    username : username,
	    description : description,
	    password : password
	}),
	contentType : 'application/json',
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    waitingDone();
	    passwordDetails.attr('data-description', description);
	    passwordDetails.dialog('option', 'title', 'Password Details - '
		    + description);
	    $('#displayUsername').text(username);
	    $('#displayPassword').text(password);

	    var passwordEntry = $('#passwordTable').find(
		    '.passwordEntry[data-passwordId="' + passwordId + '"]');
	    passwordEntry.find('.description').text(description);
	    passwordEntry.find('.showPassword').attr('data-passwordId',
		    passwordId);
	    passwordEntry.find('.deletePassword').attr('data-passwordId',
		    passwordId);

	    passwordViewMode();
	}
    });
}

function deletePasswordConfirm() {
    var passwordId = $(this).attr('data-passwordId');
    var description = $(this).attr('data-description');
    var deletePassword = $('#deletePassword');
    deletePassword.text(description);
    deletePassword.attr('data-passwordId', passwordId);

    $('#deletePasswordConfirm').dialog('open');
}

function deletePassword(passwordId) {
    pleaseWait('Deleting password, please wait...');
    $.ajax({
	type : 'POST',
	url : 'json/deletePassword',
	username : loginToken.username,
	password : loginToken.password,
	data : JSON.stringify({
	    passwordId : passwordId
	}),
	contentType : 'application/json',
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    waitingDone();
	    $('#deletePasswordConfirm').dialog('close');
	    var passwordTable = $('#passwordTable');
	    var deletedRow = passwordTable
		    .find('.passwordEntry[data-passwordId="' + passwordId
			    + '"]');
	    passwordTable.dataTable().fnDeleteRow(deletedRow[0]);
	}
    });
}

function getPasswordList() {
    var progress = $('#passwordLoadProgress');
    progress.progressbar({
	value : false,
    });
    progress.show();

    $.ajax({
	type : 'GET',
	url : 'json/getPasswords',
	username : loginToken.username,
	password : loginToken.password,
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    progress.hide();
	    $('#passwordTable').show();
	    $('#newPassword').click(newPassword);
	    if (data.passwords.length > 0) {

		// TODO what the hell does this do?
		$('.passwordEntry').each(function(passwordEntry) {
		    $(this).remove();
		});

		var passwords = data.passwords;
		var numPasswords = passwords.length;
		for ( var i = 0; i < numPasswords; ++i) {
		    var password = passwords[i];
		    addPasswordToTable(password.id, password.description);
		}
	    } else {
		$('#noPasswordsRow').show();
	    }
	}
    });
}

function addPasswordToTable(id, description) {
    var table = $('#passwordTable').dataTable();
    var tr = $('<tr>');
    tr.addClass('passwordEntry');
    tr.attr('data-passwordId', id);
    var td = $('<td>');
    tr.append(td);
    td.addClass('description').text(description);
    td = $('<td>');
    tr.append(td);
    var span = $('<span>');
    td.append(span);
    span.addClass('showPassword').attr('data-passwordId', id).text(
	    'Show Details');
    td = $('<td>');
    tr.append(td);
    span = $('<span>');
    td.append(span);
    span.append('<span>').addClass('deletePassword')
	    .attr('data-passwordId', id).attr('data-description', description)
	    .text('Delete');

    table.fnAddTr(tr[0]);

    tr.find('.showPassword').click(showPasswordDetails);
    tr.find('.deletePassword').click(deletePasswordConfirm);
    
    // every time!!
    table.find('thead th').each(function(index, value) {
	if (0 == index) {
	    return;
	}
	$(value).removeClass('sorting');
	$(value).unbind('click');
	$(value).css('cursor', 'default');
    });

    
}

function addPassword(description, username, password) {
    pleaseWait('Adding password, please wait...');
    $.ajax({
	type : 'POST',
	url : 'json/addPassword',
	username : loginToken.username,
	password : loginToken.password,
	data : JSON.stringify({
	    description : description,
	    username : username,
	    password : password
	}),
	contentType : 'application/json',
	dataType : 'json',
	success : function(data, testStatus, jqXHR) {
	    waitingDone();
	    $('#newPasswordForm').dialog("close");
	    addPasswordToTable(data.passwordId, description);
	}
    });
}
