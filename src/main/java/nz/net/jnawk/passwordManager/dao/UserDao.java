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
package nz.net.jnawk.passwordManager.dao;

import nz.net.jnawk.passwordManager.entity.UserPrivileges;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * @author amy
 */
@Component
public class UserDao {
    private static final Logger logger = LoggerFactory.getLogger(UserDao.class);
    static {
        logger.debug("Loaded");
    }

    /**
     * Saves a user and all passwords
     * 
     * @param session
     *            hibernate session to use
     * @param user
     *            the user to save
     */
    public void saveUser(Session session, UserPrivileges user) {
        session.save(user);
    }

    /**
     * @param session
     *            hibernate session to use
     * @param userId
     *            user id to remove
     */
    public void deleteUser(Session session, String userId) {
        UserPrivileges user = (UserPrivileges) session.load(UserPrivileges.class, userId);
        if (null != user) {
            logger.debug("{}: admin: {}", user.getUserCode(),
                    new Boolean(user.isAdminUser()));
            session.delete(user);
        }

    }

    /**
     * @param session
     *            hibernate session to use
     * @param username
     *            user id to find
     * @return the found user's privileges
     */
    public UserPrivileges findUserPrivileges(Session session, String username) {
        return (UserPrivileges) session.get(UserPrivileges.class, username);
    }
}
