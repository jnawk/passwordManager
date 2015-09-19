<%--
  #%L
  Password Manager
  %%
  Copyright (C) 2013 BAF Technologies Limited
  %%
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as
  published by the Free Software Foundation, either version 3 of the 
  License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public 
  License along with this program.  If not, see
  <http://www.gnu.org/licenses/gpl-3.0.html>.
  #L%
  --%>
<!DOCTYPE html>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="org.slf4j.Logger"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles"%>
<%@ taglib uri="http://jawr.net/tags" prefix="jwr"%>
<%
    Logger logger = LoggerFactory.getLogger(getClass());
			logger.info("mobile.jsp...");
%>
<html>
<head>
<title>Password Manager</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" type="text/css" media="all"
    href="//code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />
<link rel="stylesheet" type="text/css"
    href="//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css" />
<script type="text/javascript"
    src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script type="text/javascript"
    src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
<script type="text/javascript"
    src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/i18n/jquery-ui-i18n.min.js"></script>
<script type="text/javascript"
    src="//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"></script>
<script type="text/javascript"
    src="//code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
<script type="text/javascript">
    
<%="var contextRoot = '" + application.getContextPath()
					+ "';"%>
    
</script>
<jwr:style src="/passwordManager.css" />
<jwr:script src="/passwordManager-mobile.js" />
</head>
<body>
    
    <div id='loginForm' title="Login"  data-role="page">
        <div>
            <ul class="errors hidden">
            </ul>
        </div>
        <label for="username">Username</label>
        <br /> <input name="username"><br />
        <label for="password">Password</label>
        <br /> <input name="password" type="password">
        <button id="loginButton">Login</button>
    </div>

    <div id="newPasswordForm" title="New Password"  data-role="page">
        <form autocomplete="off">
            <fieldset>
                <label for="description">Description</label>
                <br /> <input name="description" /><br />
                <label for="username">Username</label>
                <br /> <input name="username" /><br />
                <label for="password">Password</label>
                <br /> <input name="password" />
            </fieldset>
        </form>
        <br/>
        <button id="addNewPasswordButton">Add Password</button>
        <button id="cancelNewPasswordButton">Cancel</button>
        <button id="newPasswordGeneratorButton">Password Generator</button>
    </div>

    <div id="passwords" title="Passwords"  data-role="page">
        <div id="passwordLoadProgress"></div>
        <table id="passwordTable" >
            <thead>
                <tr>
                    <th>Description</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <br/>
        <button id="addPasswordButton">Add Password</button>
        <button id="passwordGeneratorButton">Password Generator</button>
        <button id="logoutButton">Logout</button>
        <button id="changePasswordButton">Change Password</button>
    </div>

    <div id='passwordDetails'  data-role="page">
        <div id="passwordDetailsLoadProgress"></div>
        <table id="passwordDetailsTable" >
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Password</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td id="displayUsername"></td>
                    <td id="displayPassword"></td>
                </tr>
            </tbody>
        </table>
        <form id="editPassword" class="hidden">
            <fieldset>
                <label for="description">Description</label>
                <br /> <input name="description" /><br />
                <label for="username">Username</label>
                <br /> <input name="username" /><br />
                <label for="password">Password</label>
                <br /> <input name="password" />
            </fieldset>
        </form>
        <br/>
        <button id="passwordDetailsClose">Close</button>
        <button id="passwordDetailsEdit">Edit</button>
    </div>
    
    <div id="deletePasswordConfirm" title="Are you sure?"  data-role="page">
        <p>
            Are you sure you want to delete the password <span
                id="deletePassword"></span>
        </p>
        <br />
        <button id="deletePasswordYes">Yes</button>
        <button id="deletePasswordNo">No</button>
    </div>

    <div id="changePassword" title="Change password"  data-role="page">
        <ul class="errors hidden"></ul>
        <form autocomplete="off">
            <fieldset>
                <label for="oldPassword">Old Password</label>
                <br /> <input name="oldPassword" type="password" /><br />
                <label for="newPassword1">New Password</label>
                <br /> <input name="newPassword1" type="password" /><br />
                <label for="newPassword2">Confirm Password</label>
                <br /> <input name="newPassword2" type="password" />
            </fieldset>
        </form>
    </div>

    <div id="passwordGenerator" title="Password generator" data-role="page">
        <div class="ruleNotice">Please make sure you do not
            specify a set of rules that can generate no password.</div>
        <hr>
        <span>Generated Password: </span><input id="generatedPassword">
        <hr>
        <label for="passwordLength">Password length</label>
        <input name="passwordLength" value="12" /><br />
        <table>
            <thead>
                <tr>
                    <th colspan="4">Character Classes</th>
                    <th>Minimum</th>
                    <th>Maximum</th>
                </tr>
                <tr>
                    <td title="Lower Case">l</td>
                    <td title="Upper Case">U</td>
                    <td title="Numbers">#</td>
                    <td title="Symbols">$</td>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
</body>
</html>
