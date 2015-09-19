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
package nz.net.jnawk.passwordManager.service;

import java.security.KeyException;
import java.security.KeyStoreException;
import java.security.cert.CertificateException;
import java.util.List;

import javax.security.auth.login.LoginException;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.DuplicateEntryException;
import nz.net.jnawk.crypto.EncryptionException;
import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;
import nz.net.jnawk.passwordManager.dao.UserDao;
import nz.net.jnawk.passwordManager.entity.UserPrivileges;
import nz.net.jnawk.schemas.passwordmanager.User;

import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.asn1.x500.X500Name;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.common.collect.Lists;

/**
 * @author amy
 */
@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    static {
        logger.debug("service loaded");
    }

    @Autowired
    private SetupService setupService;

    @Autowired
    private CryptoService cryptoService;

    @Autowired
    private SessionFactoryFactory sessionFactory;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private UserDao userDao;

    /**
     * Figures out if there is an entry in the keystore relating to a user
     * 
     * @return true if there are at least 2 entries present in the keystore
     * @throws KeyStoreException
     *             if something went wrong with the keystore
     */
    public boolean isSetup() throws KeyStoreException {
        return cryptoService.getNumberOfEntries() > 1;
    }

    /**
     * @param username
     *            user's usercode
     * @param name
     *            user's name
     * @param password
     *            user's password
     * @param adminUser
     *            true if the user is an administrator
     * @return the user created
     * @throws UserSaveException
     *             if there was trouble hashing or encrypting the user password
     */
    public UserPrivileges createUser(String username, String name, String password,
            boolean adminUser) throws UserSaveException {
        Session session = sessionFactory.openSession();
        Transaction transaction = session.beginTransaction();
        try {

            UserPrivileges existingDBUser = userDao.findUserPrivileges(session, username);
            if (null != existingDBUser) {
                if (cryptoService.isAliasPresent(username)) {
                    throw new UserSaveException("User " + username + " already exists");
                }
                userDao.deleteUser(session, username);
            }
            UserPrivileges user = new UserPrivileges(username, adminUser);
            userDao.saveUser(session, user);

            X500Name subject = new X500Name("CN=" + name
                    + ",OU=users,OU=passwordManager,DC=jnawk,DC=net,DC=nz");
            cryptoService.generateNewKeysAndAddToKeystore(subject, password, username);
            transaction.commit();
            return user;
        } catch (KeyStoreException | CertificateException | KeyException
                | DuplicateEntryException e) {
            transaction.rollback();
            throw new UserSaveException(e.getMessage(), e);
        } finally {
            session.close();
        }
    }

    /**
     * Finds a user in the keystore, looks up privileges from the database, and
     * if no privileges are found, creates them.
     * <p>
     * WARNING: If creating privilege entries, and no users in the keystore have
     * admin privileges, then this user is promoted to admin.
     * 
     * @param username
     *            the user to look for
     * @return the user found
     * @throws NoSuchUserException
     *             if the user does not exist
     * @throws UserLoadException
     *             if the user could not be loaded
     */
    public User findUser(String username) throws NoSuchUserException, UserLoadException {
        Session session = sessionFactory.openSession();
        try {
            if (cryptoService.isAliasPresent(username)) {
                UserPrivileges userPrivileges = userDao.findUserPrivileges(session,
                        username);

                if (null == userPrivileges) {
                    boolean isAdminPresent = isAdminUserPresent(session);
                    logger.warn(
                            "No DB entry for user {}, admin user present: {}.  Setting admin to {}",
                            username, Boolean.valueOf(isAdminPresent),
                            Boolean.valueOf(!isAdminPresent));
                    if (!isAdminPresent) {
                        logger.warn("Creating DB entry for user {}, as admin", username);
                        Transaction transaction = session.beginTransaction();
                        userDao.saveUser(session, new UserPrivileges(username, true));
                        transaction.commit();
                    }
                    userPrivileges = new UserPrivileges(username, !isAdminPresent);
                }

                User user = new User();
                user.setUsername(username);
                user.setAdmin(new Boolean(userPrivileges.isAdminUser()));
                return user;
            }
        } catch (KeyStoreException e) {
            throw new UserLoadException(e.getMessage(), e);
        } finally {
            session.close();
        }
        throw new NoSuchUserException(username);
    }

    /**
     * @param username
     *            username to check
     * @return true if username is an admin user
     * @throws NoSuchUserException
     *             if the user entry does not exist
     */
    public boolean isAdminUser(String username) throws NoSuchUserException {
        Session session = sessionFactory.openSession();
        try {
            UserPrivileges user = userDao.findUserPrivileges(session, username);
            if (null == user) {
                throw new NoSuchUserException(username);
            }
            return user.isAdminUser();
        } finally {
            session.close();
        }
    }

    /**
     * @return list of users
     * @throws UserLoadException
     *             if there was a problem loading the keystore and therefore the
     *             users
     */
    public List<User> listUsers() throws UserLoadException {
        Session session = sessionFactory.openSession();
        try {
            List<String> aliases = cryptoService.getCertificateAliases();
            List<User> users = Lists.newArrayList();
            logger.debug("cryptoService returned {} aliases", new Integer(aliases.size()));
            aliases.remove(setupService.getSystemKey());
            for (String alias : aliases) {
                UserPrivileges userPrivileges = userDao
                        .findUserPrivileges(session, alias);
                if (null == userPrivileges) {
                    logger.warn(
                            "User {} has no user details entry, faking one without admin privileges",
                            alias);
                    userPrivileges = new UserPrivileges(alias, false);
                }
                logger.debug("Adding user {}", alias);
                User user = new User();
                user.setAdmin(Boolean.valueOf(userPrivileges.isAdminUser()));
                user.setUsername(alias);
                users.add(user);
            }
            logger.debug("returning {} users", new Integer(users.size()));
            return users;
        } catch (KeyStoreException e) {
            throw new UserLoadException(e.getMessage(), e);
        } finally {
            session.close();
        }
    }

    /**
     * @param userId
     *            user to delete
     * @throws UserDeleteException
     *             if the user could not be found
     */
    public void deleteUser(String userId) throws UserDeleteException {
        Session session = sessionFactory.openSession();
        Transaction transaction = session.beginTransaction();
        try {
            userDao.deleteUser(session, userId);
            cryptoService.deleteCertificate(userId);
            transaction.commit();
        } catch (KeyStoreException e) {
            transaction.rollback();
            throw new UserDeleteException(e.getMessage(), e);
        } finally {
            session.close();
        }

    }

    /**
     * Figures out if there is an admin user in the keystore
     * 
     * @param session
     *            hibernate session to use
     * @return true if one of the users in the keystore is admin
     * @throws KeyStoreException
     *             if there was a problem with the keystore
     */
    private boolean isAdminUserPresent(Session session) throws KeyStoreException {
        List<String> aliases = cryptoService.getCertificateAliases();
        for (String username : aliases) {
            if (username.equals(setupService.getSystemKey())) {
                continue;
            }
            UserPrivileges user = userDao.findUserPrivileges(session, username);
            if (null == user) {
                continue;
            }
            if (user.isAdminUser()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param username
     *            username
     * @param password
     *            if encrypted is true, set this to username's password,
     *            encrypted with username's public key, otherwise, set this to
     *            username's password
     * @param encrypted
     *            set to true if the supplied password is an encrypted block of
     *            text
     * @return true if username/password pair are good
     * @throws LoginException
     *             if something goes wrong
     */
    public boolean isCredentialsCorrect(String username, String password,
            boolean encrypted) throws LoginException {
        try {
            boolean correctPassword;
            if (encrypted) {
                correctPassword = passwordService.isPasswordCorrect(username,
                        Base64.decodeBase64(password));
            } else {
                correctPassword = passwordService.isPasswordCorrect(username, password);
            }
            logger.trace("Password correct?: {}", new Boolean(correctPassword));
            return correctPassword;
        } catch (KeyStoreException | EncryptionException e) {
            LoginException le = new LoginException(e.getMessage());
            le.initCause(e);
            throw le;
        }
    }

}
