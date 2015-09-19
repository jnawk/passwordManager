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

import javax.security.auth.login.LoginException;
import javax.servlet.http.HttpServletRequest;

import net.sf.uadetector.UserAgentType;
import nz.net.jnawk.passwordManager.service.NoSuchUserException;
import nz.net.jnawk.passwordManager.service.UserService;
import nz.net.jnawk.schemas.passwordmanager.LoginResponse;
import nz.net.jnawk.schemas.passwordmanager.LoginToken;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * Controller for password manager - handles view & login
 *
 * @author philip
 */
@Controller
public class RootController extends LoginTokenReturningControllerBase {
    private static final Logger logger = LoggerFactory.getLogger(RootController.class);

    static {
        logger.debug("controller loaded");
    }

    @Autowired
    private UserService userService;

    @Autowired
    private CachedUserAgentStringParser userAgentParser;

    /**
     * @param request
     *            http servlet request - used to obtain user agent header
     * @return Model and View for page to display
     */
    @RequestMapping(method = RequestMethod.GET, value = "/")
    public ModelAndView determinePageToDisplay(HttpServletRequest request) {
        if (userAgentParser.parse(request.getHeader("User-Agent")).getType() == UserAgentType.MOBILE_BROWSER) {
            return new ModelAndView("mobile");
        }
        return new ModelAndView("main");
    }

    /**
     * @param login
     *            login token
     * @return response body
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/anonymous/login")
    public @ResponseBody LoginResponse login(@RequestBody LoginToken login) {
        logger.debug("login()");
        LoginResponse response = new LoginResponse();
        try {
            String username = login.getUsername();
            String password = login.getPassword();
            logger.debug("trying to login with username:{}", username);
            if (userService.isCredentialsCorrect(username, password, false)) {
                logger.debug("Login successful for {}", username);
                addLoginToken(response, username, password);
                response.setAdmin(new Boolean(userService.isAdminUser(username)));
            } else {
                logger.debug("login unsuccessful for {}", username);
                response.getErrors().add("Credentials are not correct");
            }
        } catch (LoginException | NoSuchUserException e) {
            logger.debug("problem {}", e.getMessage(), e);
            response.getErrors().add(e.getMessage());
        }
        return response;
    }
}
