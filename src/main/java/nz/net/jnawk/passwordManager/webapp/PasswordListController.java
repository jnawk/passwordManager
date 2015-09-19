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

import nz.net.jnawk.passwordManager.service.NoSuchUserException;
import nz.net.jnawk.passwordManager.service.PasswordDeleteException;
import nz.net.jnawk.passwordManager.service.PasswordLoadException;
import nz.net.jnawk.passwordManager.service.PasswordNotFoundException;
import nz.net.jnawk.passwordManager.service.PasswordSaveException;
import nz.net.jnawk.passwordManager.service.PasswordService;
import nz.net.jnawk.schemas.passwordmanager.AddPasswordRequest;
import nz.net.jnawk.schemas.passwordmanager.AddPasswordResponse;
import nz.net.jnawk.schemas.passwordmanager.DeletePasswordRequest;
import nz.net.jnawk.schemas.passwordmanager.GetPasswordDetailsRequest;
import nz.net.jnawk.schemas.passwordmanager.GetPasswordDetailsResponse;
import nz.net.jnawk.schemas.passwordmanager.JSONResponse;
import nz.net.jnawk.schemas.passwordmanager.PasswordListResponse;
import nz.net.jnawk.schemas.passwordmanager.UnencryptedPasswordDetails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author philip
 */
@Controller
public class PasswordListController {
    private static final Logger logger = LoggerFactory
            .getLogger(PasswordListController.class);

    static {
        logger.debug("controller loaded");
    }

    @Autowired
    private PasswordService passwordService;

    /**
     * Finds a list of all the user's passwords
     * 
     * @param authToken
     *            contains user details
     * @return the passwords (no details)
     */
    @RequestMapping(method = RequestMethod.GET, value = "/json/getPasswords")
    @ResponseBody
    public PasswordListResponse getPasswordList(Authentication authToken) {
        String username = (String) authToken.getPrincipal();
        logger.debug("getting passwords for {}", username);
        PasswordListResponse response = new PasswordListResponse();
        try {
            response.getPasswords().addAll(
                    passwordService.getPasswordsByUsername(username,
                            (String) authToken.getCredentials()));
        } catch (NoSuchUserException | PasswordLoadException e) {
            logger.debug(e.getMessage(), e);
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * Adds a password
     * 
     * @param request
     *            contains the login token, and the new password details
     * @param authToken
     *            token of authenticated user
     * @return the ID of the newly added passwod
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/addPassword")
    public @ResponseBody
    AddPasswordResponse addPassword(@RequestBody AddPasswordRequest request,
            Authentication authToken) {
        AddPasswordResponse response = new AddPasswordResponse();
        try {
            response.setPasswordId(passwordService.addPasswordForUser(
                    (String) authToken.getPrincipal(), request.getDescription(),
                    request.getUsername(), request.getPassword()));
        } catch (PasswordSaveException | NoSuchUserException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * @param request
     *            contains the details
     * @param authToken
     *            contains the user details
     * @return errors or nothing
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/updatePassword")
    public @ResponseBody
    JSONResponse updatePassword(@RequestBody UnencryptedPasswordDetails request,
            Authentication authToken) {
        JSONResponse response = new JSONResponse();
        try {
            passwordService.savePassword((String) authToken.getPrincipal(), request);
        } catch (IllegalAccessException | PasswordNotFoundException | NoSuchUserException
                | PasswordSaveException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * Retrieves password details
     * 
     * @param request
     *            contains the id of the password to get details for
     * @param authToken
     *            contains user details
     * @return the password details
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/getPasswordDetails")
    public @ResponseBody
    GetPasswordDetailsResponse getPasswordDetails(
            @RequestBody GetPasswordDetailsRequest request, Authentication authToken) {
        GetPasswordDetailsResponse response = new GetPasswordDetailsResponse();
        String username = (String) authToken.getPrincipal();
        try {
            response.setDetails(passwordService.getPasswordDetailsById(username,
                    request.getPasswordId(), (String) authToken.getCredentials()));
        } catch (PasswordLoadException | PasswordNotFoundException
                | IllegalAccessException e) {
            logger.debug(e.getMessage(), e);
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * @param request
     *            contains the id of the password to delete
     * @param authToken
     *            contains user details
     * @return response
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/deletePassword")
    public @ResponseBody
    JSONResponse deletePassword(@RequestBody DeletePasswordRequest request,
            Authentication authToken) {
        JSONResponse response = new JSONResponse();
        try {
            passwordService.deletePassword((String) authToken.getPrincipal(),
                    request.getPasswordId());
        } catch (PasswordDeleteException | PasswordNotFoundException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }
}
