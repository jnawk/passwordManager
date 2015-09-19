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
function postLogin(username, password) {
	$.ajax({
		type : 'POST',
		url : 'json/anonymous/login',
		data : JSON.stringify({
			username : username,
			password : password
		}),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data, textStatus, jqXHR) {
			waitingDone();
			if (data.errors.length == 0) {
				$('#loginForm').dialog('close');
				loginToken = data.loginToken;
				admin = data.admin;
				$(document).attr('title', 'Password Manager');
				$('#passwords').dialog('open');
			} else {
				showErrors($('#loginForm'), data.errors);
			}
		}
	});
}

function login() {
	$(document).attr('title', 'PasswordManager - Login');
	$('#loginForm').dialog('open');
}

function logout() {
	$('.ui-dialog-content').each(function(index, value){
		$(value).dialog('close');
	});
	restart();
}
