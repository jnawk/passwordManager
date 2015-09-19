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
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
package nz.net.jnawk.passwordManager.webapp;

import java.security.KeyStoreException;

import nz.net.jnawk.passwordManager.service.SetupService;
import nz.net.jnawk.passwordManager.service.UserSaveException;
import nz.net.jnawk.passwordManager.service.UserService;
import nz.net.jnawk.schemas.passwordmanager.CreateUserRequest;
import nz.net.jnawk.schemas.passwordmanager.LoginResponse;
import nz.net.jnawk.schemas.passwordmanager.SetupResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Handles setup-related requests
 *
 * @author philip
 */
@Controller
public class SetupController extends LoginTokenReturningControllerBase {
    private static final Logger logger = LoggerFactory.getLogger(SetupController.class);

    static {
        logger.debug("controller loaded");
    }

    @Autowired
    private UserService userService;

    @Autowired
    private SetupService setupService;

    /**
     * For creating the first user
     *
     * @param createUserRequest
     *            JSON request body
     * @return body
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/anonymous/createFirstUser")
    public @ResponseBody LoginResponse createFirstUser(
            @RequestBody CreateUserRequest createUserRequest) {

        logger.debug("setup()");
        LoginResponse response = new LoginResponse();

        try {
            if (userService.isSetup()) {
                response.getErrors().add("Already setup!");
                // need the admin privilege to create users
            } else {
                try {
                    String username = createUserRequest.getUsername();
                    String password = createUserRequest.getPassword();
                    String name = createUserRequest.getName();
                    userService.createUser(username, name, password, true);
                    addLoginToken(response, username, password);
                    response.setAdmin(Boolean.TRUE);
                } catch (UserSaveException e) {
                    logger.debug(e.getMessage(), e);
                    response.getErrors().add(e.getMessage());
                }
            }
        } catch (KeyStoreException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * @return JSON request body
     */
    @RequestMapping(method = RequestMethod.GET, value = "/json/anonymous/isUserSetup")
    public @ResponseBody SetupResponse isSetup() {
        SetupResponse response = new SetupResponse();
        try {
            boolean isSetup = userService.isSetup();
            logger.debug("is setup?: {}", new Boolean(isSetup));
            response.setSetup(isSetup);
        } catch (KeyStoreException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * @return JSON request body
     */
    @RequestMapping(method = RequestMethod.GET, value = "/json/anonymous/isSetup")
    public @ResponseBody SetupResponse isDBSetup() {
        SetupResponse response = new SetupResponse();
        if (setupService.isRunning()) {
            response.setSetup(true);
        } else {
            response.setSetup(false);
            response.setDbLocation(setupService.getLocation());
            response.getErrors().add(setupService.getErrors());
        }
        logger.debug("is setup?: {}", new Boolean(response.isSetup()));
        return response;
    }

}
