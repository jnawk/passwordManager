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

import java.util.Arrays;

import javax.security.auth.login.LoginException;

import nz.net.jnawk.passwordManager.service.NoSuchUserException;
import nz.net.jnawk.passwordManager.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;

/**
 * @author philip
 */
public class UserAuthenticator implements AuthenticationProvider {
    private static final Logger logger = LoggerFactory.getLogger(UserAuthenticator.class);
    static {
        logger.debug("loaded");
    }

    @Autowired
    private UserService userService;

    private static GrantedAuthority USER = new GrantedAuthority() {
        private static final long serialVersionUID = 1L;

        @Override
        public String getAuthority() {
            return "USER";
        }
    };

    private static GrantedAuthority ADMIN = new GrantedAuthority() {
        private static final long serialVersionUID = 1L;

        @Override
        public String getAuthority() {
            return "ADMIN";
        }
    };

    @Override
    public Authentication authenticate(Authentication arg0)
            throws AuthenticationException {

        String username = (String) arg0.getPrincipal();
        String password = (String) arg0.getCredentials();
        try {
            userService.isCredentialsCorrect(username, password, true);
            boolean admin = userService.isAdminUser(username);
            logger.debug("login success for user: {}, admin: {}", username, new Boolean(
                    admin));
            if (admin) {
                return new UsernamePasswordAuthenticationToken(username, password,
                        Arrays.asList(ADMIN, USER));
            }
            return new UsernamePasswordAuthenticationToken(username, password,
                    Arrays.asList(USER));
        } catch (LoginException | NoSuchUserException e1) {
            logger.debug("{}", e1.getMessage(), e1);
            arg0.setAuthenticated(false);
            return arg0;
        }

    }

    @Override
    public boolean supports(Class<?> arg0) {
        return true;
    }
}
