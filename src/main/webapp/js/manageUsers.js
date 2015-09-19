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
function createUser() {
	$(document).attr('title', 'PasswordManager - Create User');
	var createUserForm = $('#createUserForm');
	var username = createUserForm.find('input[name="username"]');
	var password = createUserForm.find('input[name="password"]');
	var name = createUserForm.find('input[name="name"]');
	var adminBox = createUserForm.find('input[name="admin"]');

	createUserForm.dialog({
		autoOpen : true,
		modal : true,
		open : function() {
			adminBox.removeAttr('checked');
			if (admin) {
				adminBox.show();
			} else {
				adminBox.hide();
			}
		},
		buttons : {
			"Create User" : function() {
				pleaseWait('Creating user, please wait...');
				postCreateUser(username.val(), name.val(), password.val(),
						adminBox.is(':checked'));
			},
			"Cancel" : closeThisDialog
		}
	});
}

function postCreateUser(username, name, password, admin) {
	$.ajax({
		type : 'POST',
		url : 'json/admin/createUser',
		username : loginToken.username,
		password : loginToken.password,
		data : JSON.stringify({
			username : username,
			password : password,
			name : name,
			admin : admin
		}),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data, textStatus, jqXHR) {
			waitingDone();
			if (data.errors.length == 0) {
				$('#createUserForm').dialog('close');
				addUserToTable(username, admin);
				bindUserSpans();
			} else {
				console.log(uneval(data.errors));
			}
		}
	});
}

function createFirstUser() {
	$(document).attr('title', 'PasswordManager - Create User');
	var createUserForm = $('#createUserForm');
	var username = createUserForm.find('input[name="username"]');
	var password = createUserForm.find('input[name="password"]');
	var name = createUserForm.find('input[name="name"]');
	var admin = createUserForm.find('input[name="admin"]');

	$('#createUserForm').dialog(
			{
				autoOpen : true,
				modal : true,
				closeOnEscape : false,
				dialogClass : "no-close",
				open : function() {
					admin.attr('checked', 'checked');
					admin.attr('disabled', 'disabled');
					admin.show();
				},
				buttons : {
					"Create User" : function() {
						pleaseWait('Creating user, please wait...');
						postCreateFirstUser(username.val(), name.val(),
								password.val());
					}
				}
			});
}
function postCreateFirstUser(username, name, password) {
	$.ajax({
		type : 'POST',
		url : 'json/anonymous/createFirstUser',
		data : JSON.stringify({
			username : username,
			password : password,
			name : name
		}),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data, textStatus, jqXHR) {
			waitingDone();
			if (data.errors.length == 0) {
				$('#createUserForm').dialog('close');
				loginToken = data.loginToken;
				admin = true;
				$(document).attr('title', 'Password Manager');
				$('#passwords').dialog('open');
			} else {
				console.log(uneval(data.errors));
			}
		}
	});
}

function listUsers() {
	$('#userList').dialog('open');
}

function getUserList() {
	var progress = $('#userLoadProgress');
	progress.progressbar({
		value : false
	});
	$.ajax({
		type : 'GET',
		url : 'json/admin/getUsers',
		username : loginToken.username,
		password : loginToken.password,
		dataType : 'json',
		success : function(data, testStatus, jqXHR) {
			progress.hide();
			$('#userTable tbody').empty();
			for ( var i = 0; i < data.users.length; ++i) {
				var user = data.users[i];
				addUserToTable(user.username, user.admin);
			}
			bindUserSpans();
		}
	});
}

function bindUserSpans() {
	$('.deleteUser').unbind('click');
	$('.deleteUser').click(deleteUserConfirm);
}

function deleteUserConfirm() {
	var deleteUser = $('#deleteUser');
	var userId = $(this).attr('data-userId');
	deleteUser.text(userId);
	deleteUser.attr('data-userId', userId);
	$('#deleteUserConfirm').dialog('open');
}

function deleteUser(userId) {
	$.ajax({
		type : 'POST',
		url : 'json/admin/deleteUser',
		username : loginToken.username,
		password : loginToken.password,
		data : JSON.stringify({
			userId : userId
		}),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data, testStatus, jqXHR) {
			$('#deleteUserConfirm').dialog('close');
			$('#userTable').find('.userEntry[userId="' + userId + '"]')
					.remove();
		}
	});
}

function addUserToTable(username, admin) {
	var table = $('#userTable tbody');
	var data = '<tr class="userEntry" userId="' + username + '"><td>'
			+ username + '</td><td>';
	if (admin) {
		data += 'Yes';
	} else {
		data += 'No';
	}
	data += '</td><td>';
	if (username != loginToken.username) {
		data += '<span userId="' + username
				+ '" class="deleteUser">Delete</span>';
	}
	data += '</tr>';
	table.append(data);
}
