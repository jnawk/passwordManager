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

import java.util.HashSet;
import java.util.Set;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.PasswordGenerationException;
import nz.net.jnawk.crypto.PasswordGenerationParameter;
import nz.net.jnawk.schemas.passwordmanager.GeneratePasswordRequest;
import nz.net.jnawk.schemas.passwordmanager.GeneratePasswordResponse;
import nz.net.jnawk.schemas.passwordmanager.PasswordCriteria;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author philip
 */
@Controller
public class PasswordGeneratorController {

    @Autowired
    private CryptoService cryptoService;

    /**
     * @param request
     *            parameters for the generated password
     * @return the newly generated password
     */
    @RequestMapping(method = RequestMethod.POST, value = "/json/anonymous/passwordGenerator")
    @ResponseBody
    public GeneratePasswordResponse generatePassword(
            @RequestBody GeneratePasswordRequest request) {
        GeneratePasswordResponse response = new GeneratePasswordResponse();
        Set<PasswordGenerationParameter> parameters = new HashSet<PasswordGenerationParameter>();
        for (PasswordCriteria criteria : request.getCriteria()) {
            int characterClass = (criteria.isLower().booleanValue() ? PasswordGenerationParameter.LOWER
                    : 0)
                    + (criteria.isUpper().booleanValue() ? PasswordGenerationParameter.UPPER
                            : 0)
                    + (criteria.isNumber().booleanValue() ? PasswordGenerationParameter.NUMBERS
                            : 0)
                    + (criteria.isSymbol().booleanValue() ? PasswordGenerationParameter.SYMBOLS
                            : 0);

            PasswordGenerationParameter parameter = new PasswordGenerationParameter(
                    characterClass, criteria.getMinimum(), criteria.getMaximum());
            parameters.add(parameter);
        }

        try {
            response.setPassword(cryptoService.getRandomPassword(request
                    .getPasswordLength().intValue(), parameters));
        } catch (PasswordGenerationException e) {
            response.getErrors().add(e.getMessage());
        }

        return response;
    }
}
