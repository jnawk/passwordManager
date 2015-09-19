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
package nz.net.jnawk.passwordManager.webapp;

import nz.net.jnawk.passwordManager.service.PasswordService;
import nz.net.jnawk.schemas.passwordmanager.LoginResponse;
import nz.net.jnawk.schemas.passwordmanager.LoginToken;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * Base functionality for controllers that return an encrypted login token
 * 
 * @author philip
 */
public abstract class LoginTokenReturningControllerBase {
    /**
     * the password service
     */
    @Autowired
    protected PasswordService passwordService;

    /**
     * sets login token - token consists of user's username, and password,
     * encrypted with the system key.
     * 
     * @param response
     *            the response
     * @param username
     *            the logged in user's username
     * @param password
     *            username's password
     */
    protected void addLoginToken(LoginResponse response, String username, String password) {
        LoginToken loginToken = passwordService
                .getEncryptedLoginToken(username, password);
        response.setLoginToken(loginToken);
    }
}
