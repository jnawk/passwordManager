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

import nz.net.jnawk.passwordManager.service.PasswordChangeException;
import nz.net.jnawk.schemas.passwordmanager.ChangePasswordRequest;
import nz.net.jnawk.schemas.passwordmanager.LoginResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class ChangePasswordController extends LoginTokenReturningControllerBase {
	private static final Logger logger = LoggerFactory
			.getLogger(ChangePasswordController.class);

	static {
		logger.debug("loaded");
	}

	/**
	 * @param request
	 *            contains the new password
	 * @param authToken
	 *            contains the user details
	 * @return a new login token
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/json/changePassword")
	public @ResponseBody
	LoginResponse changePassword(@RequestBody ChangePasswordRequest request,
			Authentication authToken) {
		LoginResponse response = new LoginResponse();
		try {
			String username = (String) authToken.getPrincipal();
			if (username.equals(request.getUsername())) {
				if (!passwordService.isPasswordCorrect(username,
						request.getOldPassword())) {
					response.getErrors().add("Old password is not correct");
				} else {
					String newPassword = request.getPassword();
					String oldPasswordEncrypted = (String) authToken
							.getCredentials();
					passwordService.changePassword(username,
							oldPasswordEncrypted, newPassword);
					addLoginToken(response, username, newPassword);
				}
			} else {
				response.getErrors().add(
						"Cannot change another user's password");
			}
		} catch (PasswordChangeException e) {
			response.getErrors().add(e.getMessage());
		}
		return response;
	}
}
