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

import java.security.KeyStoreException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.List;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.EncryptionException;
import nz.net.jnawk.crypto.HashException;
import nz.net.jnawk.passwordManager.dao.PasswordDao;
import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;
import nz.net.jnawk.passwordManager.dao.UserDao;
import nz.net.jnawk.passwordManager.entity.EncryptedPassword;
import nz.net.jnawk.schemas.passwordmanager.LoginToken;
import nz.net.jnawk.schemas.passwordmanager.UnencryptedPasswordDetails;
import nz.net.jnawk.schemas.passwordmanager.UnencryptedPasswordEntry;

import org.apache.commons.codec.binary.Base64;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.common.collect.Lists;

/**
 * @author philip
 */
@Service
public class PasswordService {
    private static final Logger logger = LoggerFactory.getLogger(PasswordService.class);
    static {
        logger.debug("service loaded");
    }
    @Autowired
    private CryptoService cryptoService;

    @Autowired
    private PasswordDao passwordDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private SessionFactoryFactory sessionFactory;

    @Autowired
    private SetupService setupService;

    @Autowired
    private UserService userService;

    /**
     * @param username
     *            username of logged in user
     * @param passwordId
     *            password to delete
     * @throws PasswordNotFoundException
     *             if the password does not exist
     * @throws PasswordDeleteException
     *             if the user does not own the password
     */
    public void deletePassword(String username, String passwordId)
            throws PasswordNotFoundException, PasswordDeleteException {
        Session session = sessionFactory.openSession();
        try {
            EncryptedPassword password = passwordDao
                    .findPasswordById(session, passwordId);
            if (null == password) {
                throw new PasswordNotFoundException(passwordId);
            }

            if (!password.getUsername().equals(username)) {
                throw new PasswordDeleteException("User " + username
                        + " does not own password " + passwordId);
            }
            Transaction transaction = session.beginTransaction();
            passwordDao.deletePassword(session, password);
            transaction.commit();
        } finally {
            session.close();
        }
    }

    /**
     * @param username
     *            user making the request
     * @param request
     *            password data to update
     * @throws PasswordNotFoundException
     *             if the password does not exist
     * @throws IllegalAccessException
     *             if the password does not belong to the user
     * @throws NoSuchUserException
     *             if the user does not exist
     * @throws PasswordSaveException
     *             if there was a problem saving the password
     */
    public void savePassword(String username, UnencryptedPasswordDetails request)
            throws PasswordNotFoundException, IllegalAccessException,
            NoSuchUserException, PasswordSaveException {
        try {
            if (!cryptoService.isAliasPresent(username)) {
                throw new NoSuchUserException(username);
            }
        } catch (KeyStoreException e1) {
            throw new PasswordSaveException(e1.getMessage(), e1);
        }
        Session session = sessionFactory.openSession();
        Transaction transaction = session.beginTransaction();
        try {
            String passwordId = request.getId();
            EncryptedPassword password = passwordDao
                    .findPasswordById(session, passwordId);
            if (null == password) {
                throw new PasswordNotFoundException(passwordId);
            }
            if (!password.getUsername().equals(username)) {
                throw new IllegalAccessException("User " + username
                        + " does not own password " + passwordId);
            }
            passwordDao.deletePassword(session, password);
            EncryptedPassword newPassword = new EncryptedPassword();
            newPassword.setPasswordId(passwordId);
            newPassword.setUsername(username);
            encryptPasswordForUser(newPassword, request.getDescription(),
                    request.getUsername(), request.getPassword());
            passwordDao.savePassword(session, newPassword);
            transaction.commit();
        } catch (KeyStoreException | CertificateException | EncryptionException e) {
            transaction.rollback();
            throw new PasswordSaveException(e.getMessage(), e);
        } finally {
            session.close();
        }
    }

    private void encryptPasswordForUser(EncryptedPassword target, String description,
            String passwordUsername, String password) throws KeyStoreException,
            CertificateException, EncryptionException {
        String username = target.getUsername();
        target.setPasswordDescription(cryptoService.encrypt(username,
                description.getBytes()));
        target.setPasswordUserId(cryptoService.encrypt(username,
                passwordUsername.getBytes()));
        target.setPasswordValue(cryptoService.encrypt(username, password.getBytes()));
        target.setUsername(username);
    }

    /**
     * @param password
     *            password to check
     * @param username
     *            user to check
     * @return true if the password provides access to key that decrypts text
     *         encrypted with username's public key
     */

    public boolean isPasswordCorrect(String username, String password) {
        try {
            cryptoService.decrypt(username, password,
                    cryptoService.encrypt(username, username.getBytes()));
        } catch (KeyStoreException | EncryptionException | CertificateException e) {
            return false;
        }
        return true;
    }

    /**
     * @param username
     *            username
     * @param password
     *            password
     * @return Login Token with password encrypted
     */
    public LoginToken getEncryptedLoginToken(String username, String password) {
        try {
            LoginToken loginToken = new LoginToken();
            loginToken.setUsername(username);
            loginToken.setPassword(Base64.encodeBase64String(systemEncrypt(password
                    .getBytes())));
            return loginToken;
        } catch (KeyStoreException | CertificateException | EncryptionException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    /**
     * @param encryptedPassword
     *            password to check (encrypted with system key)
     * @param username
     *            user to check
     * @return true if the hashed password decrypts using system keys to a
     *         passowrd that provides access to the key that decrypts text
     *         encrypted with username's public key
     * @throws EncryptionException
     *             if there was a problem decrypting the stored hash
     * @throws KeyStoreException
     *             if there was a problem getting decryption keys
     */
    public boolean isPasswordCorrect(String username, byte[] encryptedPassword)
            throws KeyStoreException, EncryptionException {
        String password = new String(systemDecrypt(encryptedPassword));
        return isPasswordCorrect(username, password);
    }

    /**
     * Decrypts the password table, for a given user
     * 
     * @param username
     *            username to look up passwords for
     * @param encodedPassword
     *            user's password - for decrypting
     * @return list of passwords
     * @throws NoSuchUserException
     *             if the requested user does not exist
     * @throws PasswordLoadException
     *             if there was a problem loading passwords for the user
     */
    public List<UnencryptedPasswordEntry> getPasswordsByUsername(String username,
            String encodedPassword) throws NoSuchUserException, PasswordLoadException {
        try {
            if (!cryptoService.isAliasPresent(username)) {
                throw new NoSuchUserException("User " + username + " does not exist");
            }
        } catch (KeyStoreException e1) {
            throw new PasswordLoadException(e1.getMessage(), e1);
        }
        Session session = sessionFactory.openSession();
        try {

            List<EncryptedPassword> encryptedPasswords = passwordDao.findPasswordsByUser(
                    session, username);
            List<UnencryptedPasswordEntry> passwords = Lists.newArrayList();
            for (EncryptedPassword encryptedPasswordEntry : encryptedPasswords) {
                logger.debug("decrypting password entry");
                UnencryptedPasswordEntry password = new UnencryptedPasswordEntry();
                try {
                    String decryptedPassword = decryptUserPassword(encodedPassword);
                    password.setDescription(new String(cryptoService.decrypt(username,
                            decryptedPassword,
                            encryptedPasswordEntry.getPasswordDescription())));
                    password.setId(encryptedPasswordEntry.getPasswordId());
                    passwords.add(password);
                } catch (KeyStoreException | EncryptionException e) {
                    logger.debug("Could not decrypt a password ({})", e.getMessage(), e);
                }
            }
            logger.debug("returning {} password entries", new Integer(passwords.size()));
            return passwords;
        } finally {
            session.close();
        }
    }

    private String decryptUserPassword(String encodedPassword) throws KeyStoreException,
            EncryptionException {
        return new String(systemDecrypt(Base64.decodeBase64(encodedPassword)));
    }

    private byte[] systemDecrypt(byte[] cipherText) throws KeyStoreException,
            EncryptionException {
        return cryptoService.decrypt(setupService.getSystemKey(),
                setupService.getSystemKeyPassword(), cipherText);
    }

    private byte[] systemEncrypt(byte[] plainText) throws KeyStoreException,
            CertificateException, EncryptionException {
        return cryptoService.encrypt(setupService.getSystemKey(), plainText);
    }

    /**
     * @param username
     *            the user to add the password for
     * @param description
     *            description of the password - used in display list
     * @param passwordUsername
     *            the username associated with this user
     * @param password
     *            the password
     * @return the id of the newly added password
     * @throws PasswordSaveException
     *             if the password could not be saved
     * @throws NoSuchUserException
     *             if the user does not exist
     */
    public String addPasswordForUser(String username, String description,
            String passwordUsername, String password) throws PasswordSaveException,
            NoSuchUserException {
        try {
            if (!cryptoService.isAliasPresent(username)) {
                throw new NoSuchUserException(username);
            }
        } catch (KeyStoreException e1) {
            throw new PasswordSaveException(e1.getMessage(), e1);
        }
        Session session = sessionFactory.openSession();
        Transaction transaction = session.beginTransaction();
        try {
            EncryptedPassword newPassword = new EncryptedPassword();
            newPassword.setPasswordId(Base64.encodeBase64String(cryptoService
                    .hash(cryptoService.encrypt(username,
                            (username + System.currentTimeMillis()).getBytes()))));
            newPassword.setUsername(username);
            encryptPasswordForUser(newPassword, description, passwordUsername, password);
            passwordDao.savePassword(session, newPassword);
            transaction.commit();

            return newPassword.getPasswordId();
        } catch (EncryptionException | KeyStoreException | HashException
                | CertificateException e) {
            transaction.rollback();
            throw new PasswordSaveException("Could not save password for user "
                    + username, e);
        } finally {
            session.close();
        }
    }

    /**
     * @param username
     *            username of logged in user
     * @param passwordId
     *            the ID of the password to get details of
     * @param usersPassword
     *            the user's password
     * @return the unencrypted password entry
     * @throws PasswordLoadException
     *             if the password could not be loaded - perhaps the user
     *             doesn't own the password?
     * @throws PasswordNotFoundException
     *             if the password does not exist
     * @throws IllegalAccessException
     *             if username does not own the password identified by
     *             passwordId
     */
    public UnencryptedPasswordDetails getPasswordDetailsById(String username,
            String passwordId, String usersPassword) throws PasswordLoadException,
            PasswordNotFoundException, IllegalAccessException {
        Session session = sessionFactory.openSession();

        try {
            EncryptedPassword password = passwordDao
                    .findPasswordById(session, passwordId);
            if (null == password) {
                throw new PasswordNotFoundException(passwordId);
            }
            if (!password.getUsername().equals(username)) {
                throw new IllegalAccessException("User " + username
                        + " does not own password " + passwordId);
            }

            UnencryptedPasswordDetails details = new UnencryptedPasswordDetails();
            String decryptedPassword = decryptUserPassword(usersPassword);
            details.setUsername(new String(cryptoService.decrypt(username,
                    decryptedPassword, password.getPasswordUserId())));
            details.setPassword(new String(cryptoService.decrypt(username,
                    decryptedPassword, password.getPasswordValue())));
            details.setDescription(new String(cryptoService.decrypt(username,
                    decryptedPassword, password.getPasswordDescription())));

            return details;
        } catch (KeyStoreException | EncryptionException e) {
            throw new PasswordLoadException(e.getMessage(), e);
        } finally {
            session.close();
        }
    }

    /**
     * Changes a user's password
     * 
     * @param username
     *            user to change
     * @param oldPasswordEncoded
     *            encrypted old password, base64 encoded
     * @param newPassword
     *            new password
     * @throws PasswordChangeException
     *             if there was a problem changing the password
     */
    public void changePassword(String username, String oldPasswordEncoded,
            String newPassword) throws PasswordChangeException {
        byte[] oldPasswordEncrypted = Base64.decodeBase64(oldPasswordEncoded);
        String oldPassword;
        try {
            oldPassword = new String(systemDecrypt(oldPasswordEncrypted));
            logger.debug("changing {}'s password", username);
            cryptoService.changeKeyPassword(username, oldPassword, newPassword);
        } catch (KeyStoreException | EncryptionException | UnrecoverableKeyException e) {
            throw new PasswordChangeException(e.getMessage(), e);
        }
    }
}
