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

var $; // jQuery
var contextRoot;

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
        window.location.hash = 'passwords';
        $('body').unbind('keyup');
        getPasswords();
    }
}

function loginButtonClick() {
    console.log('login button');
    var username = $('#login input[name="username"]').val();
    var password = $('#login input[name="password"]').val();
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

function acceptingNewMembersSuccess(data) {
    console.log('get new user success');
    $('#loginForm-pleaseWait').hide();
    $('#loginForm').show();
    if (data.S == true) {
        $('#newUserContainer').show();
    }

    $('body').bind('keyup', function (event) {
        if (event.keyCode == 13) {
            event.stopPropagation();
            loginButtonClick();
        }
    });

}

function login_page_show() { // eslint-disable-line no-unused-vars
    console.log('login pageshow');
    if ('undefined' == typeof localStorage.token) {
        console.log('null token showing login page');
    } else {
        // TODO got a token, check it
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

// function newPasswordClick() {
//     $('body').pagecontainer('change', '#newPasswordForm');
// }

// function passwordsPageCreate() {
//     console.log('passwords page created');
//     $('#newPassword').click(newPasswordClick);
// }

// function putPasswordSuccess(data) {
//     localStorage.setItem('token', data.token);
//     bodyClickCancelButton();
// }

// function addButtonClick() {
//     var description = $('#newPasswordForm input[name="description"]').val();
//     var username = $('#newPasswordForm input[name="username"').val();
//     var password = $('#newPasswordForm input[name="password"').val();
//     $.ajax({
//         type: 'PUT',
//         url: contextRoot + '/putPassword',
//         datType: 'json',
//         contentType: 'application/json',
//         data: JSON.stringify({
//             token: localStorage.token,
//             description: description,
//             username: username,
//             password: password
//         }),
//         success: putPasswordSuccess
//     });
// }

// function newPasswordFormPageCreate() {
//     console.log('new password page created');
//
//     $('#addButton').click(addButtonClick);
// }

function bodyClickCancelButton() {
    window.history.back();
}

// function bodyClickLogoutButton() {
//     localStorage.removeItem('token');
//     land();
// }

// function bodyClickShowDetailsButton() {
//     console.log('show details button clicked ');
//
//     localStorage.setItem('passwordIdForShowDetails', $(this).parent().parent().parent().parent().attr('data-passwordId'));
//     $('body').pagecontainer('change', '#showPasswordDetails');
// }

// function editPasswordButtonClick() {
//     $('input[name="passwordDescription"').val($('#passwordDescription').text());
//     $('input[name="passwordUsername"').val($('#passwordUsername').text());
//     $('input[name="passwordPassword"').val($('#passwordPassword').text());
//
//     $('input.hidden').parent().show();
//     $('#passwordDetailsList span').hide();
//     $('#editPasswordButton').hide();
//     $('#savePasswordButton').show();
// }

// function deletePasswordSuccess(data) {
//     localStorage.setItem('token', data.token);
//     bodyClickCancelButton();
// }

// function deletePasswordButtonClick() {
//     $.ajax({
//         type: 'POST',
//         url: contextRoot + '/delete-password',
//         dataType: 'json',
//         contentType: 'application/json',
//         data: JSON.stringify({
//             token: localStorage.token,
//             passwordId: localStorage.passwordIdForShowDetails
//         }),
//         success: deletePasswordSuccess
//     });
// }

// function savePasswordSuccess(data) {
//     localStorage.setItem('token', data.token);
//     bodyClickCancelButton();
// }

// function savePasswordButtonClick() {
//     $.ajax({
//         type: 'PUT',
//         url: contextRoot + '/putPassword',
//         dataType: 'json',
//         contentType: 'application/json',
//         data: JSON.stringify({
//             token: localStorage.token,
//             passwordId: localStorage.passwordIdForShowDetails,
//             description: $('input[name="passwordDescription"').val(),
//             username: $('input[name="passwordUsername"').val(),
//             password: $('input[name="passwordPassword"').val()
//         }),
//         success: savePasswordSuccess
//     });
// }

// function showPasswordDetailsPageCreate() {
//     $('#editPasswordButton').click(editPasswordButtonClick);
//     $('#savePasswordButton').click(savePasswordButtonClick);
//     $('#deletePasswordButton').click(deletePasswordButtonClick);
// }

function getPasswordDetailsSuccess(data) {
    localStorage.setItem('token', data.token);
    $('#passwordDescription').text(data.description);
    $('#passwordUsername').text(data.username);
    $('#passwordPassword').text(data.password);
}

function showPassword_page_show() { // eslint-disable-line no-unused-vars
    if ('undefined' == typeof localStorage.passwordIdForShowDetails) {
        bodyClickCancelButton();
        return;
    }
    console.log(localStorage.passwordIdForShowDetails);

    $('input.hidden').parent().hide();
    $('button.hidden').hide();
    $('#editPasswordButton').show();

    $('#passwordDescription').text('loading...');
    $('#passwordUsername').text('loading...');
    $('#passwordPassword').text('loading...');

    $('#passwordDescription').show();
    $('#passwordUsername').show();
    $('#passwordPassword').show();

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

// function newPasswordFormPageShow() {
//     $('input[name="description"').val('');
//     $('input[name="username"').val('');
//     $('input[name="password"').val('');
// }

function getPasswordsSuccess(data) {
    if (data.passwords) {
        console.log('getPassword success');
        console.log(JSON.stringify(data));
        localStorage.setItem('token', data.token);
        $('#passwordList').empty();
        var thead = $('<thead>');
        var tr = $('<tr>');
        var thDescription = $('<th>');
        thDescription.text('Description');
        thead.append(tr);
        tr.append(thDescription);
        $('#passwordList').append(thead);
        $('#passwordList').DataTable({
            columns: [
                {
                    data: function(item) {
                        return '<a id=\'' + item.passwordId + '\' class="passwordLink">' + item.description + '</a>';
                    }
                }
            ]
        });

        data.passwords.forEach(addListedPassword);
    }
}

function addListedPassword(password) {
    $('#passwordList').DataTable().row.add(password).draw(false);
}

function getPasswords() {
    console.log('displayPasswords()');
    if ('undefined' == typeof localStorage.token) {
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
        success: getPasswordsSuccess
    });
}

// function validateTokenSuccess(data) {
//     if (data.errorMessage) {
//         localStorage.removeItem('token');
//         window.location.hash = 'login';
//     } else {
//         console.log('validate-token success');
//         console.log(JSON.stringify(data));
//         localStorage.setItem('token', data.token);
//         var targetPage = $(window.location.hash);
//         getPasswords();
//         if(0 == targetPage.length) {
//             console.log('no such page ' + window.location.hash);
//             window.location.hash = 'passwords';
//         } else {
//             hashChange();
//         }
//     }
// }

function hashChange() {
    var targetPage = $(window.location.hash);

    if(0 == targetPage.length) {
        console.log('no such page ' + hash);
        return;
    }

    console.log('showing page ' + targetPage[0].id);
    $('div.page:visible').each(function(index, item) {
        if(item.id != targetPage[0].id) {
            console.log('hiding ' + item.id);
            $(item).addClass('hidden');
            var hideFunction = window[item.id + '_page_hide'];
            console.log('searching for ' + item.id + '_page_hide function');
            if(typeof hideFunction == 'function') {
                hideFunction();
            }
        }
    });
    targetPage.removeClass('hidden');
    var showFunction = window[targetPage[0].id + '_page_show'];
    console.log('searching for ' + targetPage[0].id + '_page_show function');
    if(typeof showFunction == 'function') {
        showFunction();
    }
}

function init() {
    console.log('valid token?');
    // if('undefined' == typeof localStorage.token) {
    window.location.hash = 'login';
    hashChange();
    // } else {
    //     $.ajax({
    //         type: 'POST',
    //         url: contextRoot + '/validate-token',
    //         dataType: 'json',
    //         contentType: 'application/json',
    //         data: JSON.stringify({
    //             token: localStorage.token
    //         }),
    //         success: validateTokenSuccess
    //     });
    // }

    $(window).on('hashchange', hashChange);

    $('#passwordList').on('click', '.passwordLink', function(e){
        console.log($(e.target).attr('id'));
        localStorage.setItem('passwordIdForShowDetails', $(e.target).attr('id'));
        window.location.hash = 'showPassword';
    });

    $('#loginButton').click(loginButtonClick);
    $('#newUser').click(newUserClick);
    $('#signup').click(signupClick);}

$(init);
