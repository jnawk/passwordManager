package nz.net.jnawk.passwordManager.service;

import static nz.net.bafonline.manualAutowireTools.Wire.wire;
import static org.easymock.EasyMock.aryEq;
import static org.easymock.EasyMock.cmp;
import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.createStrictMock;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.security.KeyStoreException;
import java.security.cert.CertificateException;
import java.util.List;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.EncryptionException;
import nz.net.jnawk.passwordManager.EncryptedPasswordComparator;
import nz.net.jnawk.passwordManager.dao.PasswordDao;
/*
 * import static org.junit.Assert.assertFalse;
 * import static org.junit.Assert.assertTrue;
 */
import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;
import nz.net.jnawk.passwordManager.entity.EncryptedPassword;
import nz.net.jnawk.schemas.passwordmanager.UnencryptedPasswordDetails;

import org.easymock.LogicalOperator;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * Tests of password service
 *
 * @author philip
 */
public class PasswordServiceTest {
    private PasswordService passwordService;
    private Session mockSession;
    private PasswordDao mockPasswordDao;
    private CryptoService mockCryptoService;

    private final String USERNAME = "username";
    private final String BOGUS_USERNAME = "bogus username";
    private final String PASSWORD_ID = "password id";
    private final String DESCRIPTION = "description";
    private final String PASSWORD = "password";
    private final byte[] BYTES = "bytes".getBytes();

    /**
     * @throws NoSuchFieldException
     *             unexpected
     * @throws SecurityException
     *             unexpected
     * @throws IllegalArgumentException
     *             unexpected
     * @throws IllegalAccessException
     *             unexpected
     */
    @Before
    public void setup() throws NoSuchFieldException, SecurityException,
    IllegalArgumentException, IllegalAccessException {
        passwordService = new PasswordService();

        mockPasswordDao = createStrictMock(PasswordDao.class);
        mockCryptoService = createStrictMock(CryptoService.class);

        mockSession = createNiceMock(Session.class);
        SessionFactoryFactory mockSessionFactoryFactory = createNiceMock(SessionFactoryFactory.class);
        Transaction mockTransaction = createNiceMock(Transaction.class);

        wire(passwordService, "sessionFactory", mockSessionFactoryFactory);
        wire(passwordService, "passwordDao", mockPasswordDao);
        wire(passwordService, "cryptoService", mockCryptoService);

        /*
         * private CryptoService cryptoService;
         * private UserDao userDao;
         * private SetupService setupService;
         * private UserService userService;
         */

        reset(mockPasswordDao);
        reset(mockCryptoService);
        reset(mockSessionFactoryFactory);
        reset(mockTransaction);

        expect(mockSessionFactoryFactory.openSession()).andStubReturn(mockSession);
        expect(mockSession.beginTransaction()).andStubReturn(mockTransaction);

        replay(mockSession);
        replay(mockSessionFactoryFactory);
        replay(mockTransaction);
    }

    /**
     * verify all expected calls were made
     */
    @After
    public void verifyExpectations() {
        verify(mockPasswordDao);
        verify(mockCryptoService);
    }

    private void replayAll() {
        replay(mockPasswordDao);
        replay(mockCryptoService);
    }

    /**
     * @throws PasswordNotFoundException
     *             unexpected
     * @throws PasswordDeleteException
     *             unexpected
     */
    @Test
    public void deletePassword_ok() throws PasswordNotFoundException,
    PasswordDeleteException {
        EncryptedPassword encryptedPassword = new EncryptedPassword();
        encryptedPassword.setPasswordId(PASSWORD_ID);
        encryptedPassword.setUsername(USERNAME);

        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID)).andReturn(
                encryptedPassword);
        mockPasswordDao.deletePassword(mockSession, encryptedPassword);
        expectLastCall();
        replayAll();
        passwordService.deletePassword(USERNAME, PASSWORD_ID);
    }

    /**
     * @throws PasswordNotFoundException
     *             not expected
     * @throws PasswordDeleteException
     *             expected
     */
    @Test(expected = PasswordDeleteException.class)
    public void deletePassword_notOwner() throws PasswordNotFoundException,
    PasswordDeleteException {
        EncryptedPassword encryptedPassword = new EncryptedPassword();
        encryptedPassword.setPasswordId(PASSWORD_ID);
        encryptedPassword.setUsername(BOGUS_USERNAME);

        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID)).andReturn(
                encryptedPassword);
        replayAll();
        passwordService.deletePassword(USERNAME, PASSWORD_ID);
    }

    /**
     * @throws PasswordNotFoundException
     *             expected
     * @throws PasswordDeleteException
     *             unexpected
     */
    @Test(expected = PasswordNotFoundException.class)
    public void deletePassword_notFound() throws PasswordNotFoundException,
    PasswordDeleteException {
        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID))
        .andReturn(null);
        replayAll();
        passwordService.deletePassword(USERNAME, PASSWORD_ID);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws CertificateException
     *             not expected
     * @throws EncryptionException
     *             not expected
     * @throws IllegalAccessException
     *             not expected
     * @throws PasswordNotFoundException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws PasswordSaveException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void savePassword_ok() throws KeyStoreException, CertificateException,
    EncryptionException, IllegalAccessException, PasswordNotFoundException,
    NoSuchUserException, PasswordSaveException {
        EncryptedPassword encryptedPassword = new EncryptedPassword();
        encryptedPassword.setPasswordId(PASSWORD_ID);
        encryptedPassword.setUsername(USERNAME);

        EncryptedPassword newPassword = new EncryptedPassword();
        newPassword.setPasswordId(PASSWORD_ID);
        newPassword.setUsername(USERNAME);
        newPassword.setPasswordUserId(BYTES);
        newPassword.setPasswordValue(BYTES);
        newPassword.setPasswordDescription(BYTES);

        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(true);
        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID)).andReturn(
                encryptedPassword);
        mockPasswordDao.deletePassword(mockSession, encryptedPassword);
        expectLastCall();
        expect(mockCryptoService.encrypt(eq(USERNAME), aryEq(DESCRIPTION.getBytes())))
        .andReturn(BYTES);
        expect(mockCryptoService.encrypt(eq(USERNAME), aryEq(USERNAME.getBytes())))
        .andReturn(BYTES);
        expect(mockCryptoService.encrypt(eq(USERNAME), aryEq(PASSWORD.getBytes())))
        .andReturn(BYTES);
        mockPasswordDao
        .savePassword(
                eq(mockSession),
                cmp(newPassword, new EncryptedPasswordComparator(),
                        LogicalOperator.EQUAL));
        expectLastCall();
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        request.setId(PASSWORD_ID);
        request.setDescription(DESCRIPTION);
        request.setPassword(PASSWORD);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws CertificateException
     *             not expected
     * @throws EncryptionException
     *             not expected
     * @throws IllegalAccessException
     *             not expected
     * @throws PasswordNotFoundException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws PasswordSaveException
     *             expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = PasswordSaveException.class)
    public void savePassword_exceptionOnEncrypt() throws KeyStoreException,
    CertificateException, EncryptionException, IllegalAccessException,
    PasswordNotFoundException, NoSuchUserException, PasswordSaveException {
        EncryptedPassword encryptedPassword = new EncryptedPassword();
        encryptedPassword.setPasswordId(PASSWORD_ID);
        encryptedPassword.setUsername(USERNAME);

        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(true);
        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID)).andReturn(
                encryptedPassword);
        mockPasswordDao.deletePassword(mockSession, encryptedPassword);
        expectLastCall();
        expect(mockCryptoService.encrypt(eq(USERNAME), aryEq(DESCRIPTION.getBytes())))
        .andThrow(new KeyStoreException());
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        request.setId(PASSWORD_ID);
        request.setDescription(DESCRIPTION);
        request.setPassword(PASSWORD);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws IllegalAccessException
     *             expected
     * @throws PasswordNotFoundException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws PasswordSaveException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = IllegalAccessException.class)
    public void savePassword_notOwner() throws KeyStoreException, IllegalAccessException,
    PasswordNotFoundException, NoSuchUserException, PasswordSaveException {
        EncryptedPassword encryptedPassword = new EncryptedPassword();
        encryptedPassword.setPasswordId(PASSWORD_ID);
        encryptedPassword.setUsername(BOGUS_USERNAME);

        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(true);
        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID)).andReturn(
                encryptedPassword);
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        request.setId(PASSWORD_ID);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws IllegalAccessException
     *             not expected
     * @throws PasswordNotFoundException
     *             expected
     * @throws NoSuchUserException
     *             not expected
     * @throws PasswordSaveException
     *             not expected
     * @throws KeyStoreException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = PasswordNotFoundException.class)
    public void savePassword_passwordNotFound() throws IllegalAccessException,
    PasswordNotFoundException, NoSuchUserException, PasswordSaveException,
    KeyStoreException {
        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(true);
        expect(mockPasswordDao.findPasswordById(mockSession, PASSWORD_ID))
        .andReturn(null);
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        request.setId(PASSWORD_ID);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws IllegalAccessException
     *             not expected
     * @throws PasswordNotFoundException
     *             not expected
     * @throws NoSuchUserException
     *             expected
     * @throws PasswordSaveException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = NoSuchUserException.class)
    public void savePassword_noSuchUser() throws KeyStoreException,
    IllegalAccessException, PasswordNotFoundException, NoSuchUserException,
    PasswordSaveException {
        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(false);
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws IllegalAccessException
     *             not expected
     * @throws PasswordNotFoundException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws PasswordSaveException
     *             expected
     * @throws KeyStoreException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = PasswordSaveException.class)
    public void savePassword_exceptionSearchingForUser() throws IllegalAccessException,
    PasswordNotFoundException, NoSuchUserException, PasswordSaveException,
    KeyStoreException {
        expect(mockCryptoService.isAliasPresent(USERNAME)).andThrow(
                new KeyStoreException());
        replayAll();
        UnencryptedPasswordDetails request = new UnencryptedPasswordDetails();
        request.setUsername(USERNAME);
        passwordService.savePassword(USERNAME, request);
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws NoSuchUserException
     *             unexpected
     * @throws PasswordLoadException
     *             unexpected
     */
    @SuppressWarnings("boxing")
    @Test
    public void getPasswordsByUsername_noPasswords() throws KeyStoreException,
    NoSuchUserException, PasswordLoadException {
        List<EncryptedPassword> encryptedPasswords = Lists.newArrayList();
        expect(mockCryptoService.isAliasPresent(USERNAME)).andReturn(true);
        expect(mockPasswordDao.findPasswordsByUser(mockSession, USERNAME)).andReturn(
                encryptedPasswords);
        replayAll();
        assertEquals(0, passwordService.getPasswordsByUsername(USERNAME, PASSWORD).size());
    }
}
