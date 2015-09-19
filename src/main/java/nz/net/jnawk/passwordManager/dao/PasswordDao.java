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
/**
 * 
 */
package nz.net.jnawk.passwordManager.dao;

import java.util.ArrayList;
import java.util.List;

import nz.net.jnawk.passwordManager.entity.EncryptedPassword;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * @author amy
 */
@Component
public class PasswordDao {
    private static final Logger logger = LoggerFactory.getLogger(PasswordDao.class);
    static {
        logger.debug("DAO loaded");
    }

    /**
     * @param session
     *            the hibernate session
     * @param username
     *            the username to find passwords for
     * @return a list of all the user's passwords
     */
    public List<EncryptedPassword> findPasswordsByUser(Session session, String username) {
        Criteria criteria = session.createCriteria(EncryptedPassword.class);
        criteria.add(Restrictions.eq("username", username));
        List<EncryptedPassword> passwords = new ArrayList<EncryptedPassword>();
        for (Object o : criteria.list()) {
            if (o instanceof EncryptedPassword) {
                passwords.add((EncryptedPassword) o);
            } else {
                logger.warn("Got something from the encryptedPassword table that isn't an encrypted password");
            }
        }

        return passwords;
    }

    /**
     * @param session
     *            the hibernate session
     * @param password
     *            the password to save
     */
    public void savePassword(Session session, EncryptedPassword password) {
        session.save(password);
    }

    /**
     * @param session
     *            the hibernate session
     * @param password
     *            the password to delete
     */
    public void deletePassword(Session session, EncryptedPassword password) {
        session.delete(password);
    }

    /**
     * @param session
     *            the hibernate session
     * @param passwordId
     *            the id of the password
     * @return the password details
     */
    public EncryptedPassword findPasswordById(Session session, String passwordId) {
        return (EncryptedPassword) session.get(EncryptedPassword.class, passwordId);
    }

}
