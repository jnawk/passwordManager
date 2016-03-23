/*
 * #%L
 * Password Manager
 * %
 * Copyright (C) 2013 BAF Technologies Limited
 * %
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
    if (password != password2) {
        return false;
    }
    // TODO more checks here
    return true;
}

function processLogin(data) {
    console.log('processLogin()');
    $('#login input[name="password"]').val('');
    if (data.errorMessage) {
        console.log('login failure');
        console.log(data.errorMessage);
        return;
    }
    if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('navigating to #passwords');
        $('body').pagecontainer('change', '#passwords');
    }
}

function land() {
    if ('undefined' == typeof localStorage.token) {
        console.log('null token showing login page');
        $('body').pagecontainer('change', '#login');
    } else {
        // got a token, check it
        $('body').pagecontainer('change', '#passwords');
    }
}

function addListedPassword(password) {
    var newPassword = $('<li>');
    var newPasswordRowDiv = $('<div>');
    var newPasswordCellDiv = $('<div>');
    var description = $('<span>');
    var showDetails = $('<span>');
    var showDetailsButton = $('<button>');

    description.text(password.description);
    description.addClass('passwordDescription');

    showDetailsButton.text('Show Details');
    showDetails.append(showDetailsButton);
    showDetails.addClass('showDetailsButton');

    newPasswordCellDiv.append(description);
    newPasswordCellDiv.append(showDetails);
    newPasswordCellDiv.addClass('passwordEntryCell')

    newPasswordRowDiv.addClass('passwordEntry');
    newPasswordRowDiv.append(newPasswordCellDiv);

    newPassword.append(newPasswordRowDiv);

    newPassword.attr('data-passwordId', password.passwordId);
    $('#passwordList').append(newPassword);
}

function loginButtonClick() {
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
        success: processLogin
    });
}

function newUserClick() {
    console.log('new user button');
    $('#loginButtonContainer').hide();
    $('#newUserContainer').hide();
    $('#newUserPasswordContainer').show();
}

function signupClick() {
    $('signup button');
    var username = $('#loginForm input[name="username"]').val();
    var password = $('#loginForm input[name="password"]').val();
    var password2 = $('#loginForm input[name="password2"]').val();

    if (!validatePassword(password, password2)) {
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
        success: processLogin
    });
}

function loginPageCreate() {
    console.log('login page created');
    $('#loginButton').click(loginButtonClick);
    $('#newUser').click(newUserClick);
    $('#signup').click(signupClick);
}

function acceptingNewMembersSuccess(data) {
    console.log('get new user success');
    $('#loginForm-pleaseWait').hide();
    $('#loginForm').show();
    if (data) {
        $('#newUserContainer').show();
    }
}

function loginPageShow() {
    console.log('login pageshow');
    if ('undefined' == typeof localStorage.token) {
        console.log('null token showing login page');
    } else {
        // TODO got a token, check it
        $('body').pagecontainer('change', '#passwords');
        return;
    }

    $('#loginForm').hide();
    $('#loginForm-pleaseWait').show();
    $.ajax({
        type: 'GET',
        url: contextRoot + '/accepting-new-members',
        dataType: 'json',
        success: acceptingNewMembersSuccess
    });
}

function newPasswordClick() {
    $('body').pagecontainer('change', '#newPasswordForm');
}

function passwordsPageCreate() {
    console.log('passwords page created');
    $('#newPassword').click(newPasswordClick);
}

function putPasswordSuccess(data, textStatus, jqXHR) {
    // TODO implement
}

function addButtonClick() {
    var description = $('#newPasswordForm input[name="description"]').val();
    var username = $('#newPasswordForm input[name="username"').val();
    var password = $('#newPasswordForm input[name="password"').val();
    $.ajax({
        type: 'PUT',
        url: contextRoot + '/putPassword',
        datType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            token: localStorage.token,
            description: description,
            username: username,
            password: password
        }),
        success: putPasswordSuccess
    });
}

function newPasswordFormPageCreate() {
    console.log('new password page created');

    $('#addButton').click(addButtonClick);
}

function getPasswordsSuccess(data) {
    if (data.errorMessage) {
        localStorage.removeItem('token');
        land();
    } else {
        console.log('getPassword success');
        console.log(JSON.stringify(data));
        localStorage.setItem('token', data.token);
        $('#passwordList').empty();
        data.passwords.forEach(addListedPassword);
    }
}

function passwordsPageShow() {
    console.log('displayPasswords()');
    if ('undefined' == typeof localStorage.token) {
        console.log('not logged in');
        $('body').pagecontainer('change', '#login');
        return;
    } else {
        // TODO got a token, check it
    }
    $.ajax({
        type: 'POST',
        url: contextRoot + '/getPasswords',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            token: localStorage.token
        }),
        success: getPasswordsSuccess
    });
}

function bodyClickCancelButton() {
    window.history.back();
}

function bodyClickLogoutButton() {
    localStorage.removeItem('token');
    land();
}

function validateTokenSuccess(data) {
    if (data.errorMessage) {
        localStorage.removeItem('token');
        land();
    } else {
        console.log('validate-token success');
        console.log(JSON.stringify(data));
        localStorage.setItem('token', data.token);
    }
}

function bodyClickShowDetailsButton() {
    console.log('show details button clicked ');

    localStorage.setItem('passwordIdForShowDetails', $(this).parent().parent().parent().parent().attr('data-passwordId'));
    $('body').pagecontainer('change', '#showPasswordDetails');
}

function editPasswordButtonClick() {

}

function deletePasswordSuccess(data) {
    localStorage.setItem('token', data.token);
    bodyClickCancelButton();
}

function deletePasswordButtonClick() {
    $.ajax({
        type: 'POST',
        url: contextRoot + '/delete-password',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({

        }),
        success: deletePasswordSuccess
    });
}

function showPasswordDetailsPageCreate() {
    $('#editPasswordButton').click(editPasswordButtonClick);
    $('#deletePasswordButton').click(deletePasswordButtonClick);
}

function getPasswordDetailsSuccess(data) {
    localStorage.setItem('token', data.token);
    $('#passwordDescription').text(data.description);
    $('#passwordUsername').text(data.username);
    $('#passwordPassword').text(data.password);
}

function showPasswordDetailsPageShow() {
    if ('undefined' == typeof localStorage.passwordIdForShowDetails) {
        bodyClickCancelButton();
        return;
    }
    console.log(localStorage.passwordIdForShowDetails);
    $.ajax({
        type: 'POST',
        url: contextRoot + '/get-password-details',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            token: localStorage.token,
            passwordId: localStorage.passwordIdForShowDetails
        }),
        success: getPasswordDetailsSuccess
    });
}

function init() {
    console.log("$ handler running");

    $('#login').on('pagecreate', loginPageCreate);
    $('#login').on('pageshow', loginPageShow);
    $('#passwords').on('pagecreate', passwordsPageCreate);
    $('#passwords').on('pageshow', passwordsPageShow);
    $('#newPasswordForm').on('pagecreate', newPasswordFormPageCreate);
    $('#showPasswordDetails').on('pagecreate', showPasswordDetailsPageCreate);
    $('#showPasswordDetails').on('pageshow', showPasswordDetailsPageShow);

    $('body').on('click', '.cancelButton', bodyClickCancelButton);
    $('body').on('click', '.logoutButton', bodyClickLogoutButton);
    $('body').on('click', '.showDetailsButton button', bodyClickShowDetailsButton);

    $('#landing').on('pageshow', land);

    // TODO these don't interact quite right
    if (window.location.hash == '') {
        land();
    }

    if ('undefined' == typeof localStorage.token) {
        console.log('null token showing login page');
        $('body').pagecontainer('change', '#login');
    } else {
        console.log('valid token?');
        $.ajax({
            type: 'POST',
            url: contextRoot + '/validate-token',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                token: localStorage.token
            }),
            success: validateTokenSuccess
        });
    }
}

$(init);