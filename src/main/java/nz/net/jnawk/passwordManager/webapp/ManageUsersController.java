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

import java.util.List;

import nz.net.jnawk.passwordManager.service.UserDeleteException;
import nz.net.jnawk.passwordManager.service.UserLoadException;
import nz.net.jnawk.passwordManager.service.UserSaveException;
import nz.net.jnawk.passwordManager.service.UserService;
import nz.net.jnawk.schemas.passwordmanager.CreateUserRequest;
import nz.net.jnawk.schemas.passwordmanager.DeleteUserRequest;
import nz.net.jnawk.schemas.passwordmanager.GetUsersResponse;
import nz.net.jnawk.schemas.passwordmanager.JSONResponse;
import nz.net.jnawk.schemas.passwordmanager.User;

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
public class ManageUsersController {
    private static final Logger logger = LoggerFactory
            .getLogger(ManageUsersController.class);
    static {
        logger.debug("loaded");
    }

    @Autowired
    private UserService userService;

    /**
     * For creating a user
     * 
     * @param request
     *            JSON request body
     * @return body
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/admin/createUser")
    public @ResponseBody
    JSONResponse createUser(@RequestBody CreateUserRequest request) {
        logger.debug("create user");
        JSONResponse response = new JSONResponse();

        try {
            String username = request.getUsername();
            String password = request.getPassword();
            String name = request.getName();
            boolean isAdmin = request.isAdmin().booleanValue();
            userService.createUser(username, name, password, isAdmin);

        } catch (UserSaveException e) {
            logger.debug(e.getMessage(), e);

            response.getErrors().add(e.getMessage());
        }
        return response;
    }

    /**
     * For creating a user
     * 
     * @param request
     *            JSON request body
     * @param authToken
     *            contains logged in user
     * @return body
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/admin/deleteUser")
    public @ResponseBody
    JSONResponse deleteUser(Authentication authToken,
            @RequestBody DeleteUserRequest request) {
        logger.debug("delete user");
        JSONResponse response = new JSONResponse();
        String username = (String) authToken.getPrincipal();
        String userId = request.getUserId();
        if (!username.equals(userId)) {
            try {
                userService.deleteUser(userId);
            } catch (UserDeleteException e) {
                response.getErrors().add(e.getMessage());
            }
        } else {
            response.getErrors().add("Can't delete self");
        }

        return response;
    }

    /**
     * @return list of users
     */
    @RequestMapping(method = RequestMethod.GET, value = "/json/admin/getUsers")
    public @ResponseBody
    GetUsersResponse listUsers() {
        GetUsersResponse response = new GetUsersResponse();
        try {
            List<User> users = userService.listUsers();
            logger.debug("returning {} users", new Integer(users.size()));
            response.getUsers().addAll(users);
        } catch (UserLoadException e) {
            response.getErrors().add(e.getMessage());
        }
        return response;
    }
}
