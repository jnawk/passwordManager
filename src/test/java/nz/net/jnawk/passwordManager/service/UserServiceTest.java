package nz.net.jnawk.passwordManager.service;

import static nz.net.bafonline.manualAutowireTools.Wire.wire;
import static org.easymock.EasyMock.aryEq;
import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.createStrictMock;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.security.KeyException;
import java.security.KeyStoreException;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.security.auth.login.LoginException;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.DuplicateEntryException;
import nz.net.jnawk.crypto.EncryptionException;
import nz.net.jnawk.passwordManager.UserComparator;
import nz.net.jnawk.passwordManager.UserPrivilegesWithEquals;
import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;
import nz.net.jnawk.passwordManager.dao.UserDao;
import nz.net.jnawk.schemas.passwordmanager.User;

import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.asn1.x500.X500Name;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * test the user service
 *
 * @author philip
 */
public class UserServiceTest {
    private UserService userService;
    private CryptoService mockCryptoService;
    private UserDao mockUserDao;
    private Session mockSession;
    private SetupService setupService;
    private PasswordService mockPasswordService;

    private final String BOGUS_USER_NAME = "bogus_username";
    private final String USER_NAME = "username";
    private final String NAME = "name";
    private final String PASSWORD = "password";
    private final String ENCODED_PASSWORD = Base64
            .encodeBase64String(PASSWORD.getBytes());
    private final boolean ADMIN = false;

    private UserPrivilegesWithEquals user;
    private X500Name subject;

    /**
     * set everything up
     *
     * @throws NoSuchFieldException
     *             if wiring problem
     * @throws SecurityException
     *             if wiring problem
     * @throws IllegalArgumentException
     *             if wiring problem
     * @throws IllegalAccessException
     *             if wiring problem
     */
    @Before
    public void setup() throws NoSuchFieldException, SecurityException,
            IllegalArgumentException, IllegalAccessException {
        userService = new UserService();

        mockCryptoService = createStrictMock(CryptoService.class);
        mockUserDao = createStrictMock(UserDao.class);
        mockSession = createNiceMock(Session.class);
        setupService = new SetupService();
        mockPasswordService = createStrictMock(PasswordService.class);
        SessionFactoryFactory mockSessionFactoryFactory = createNiceMock(SessionFactoryFactory.class);
        Transaction mockTransaction = createNiceMock(Transaction.class);

        user = new UserPrivilegesWithEquals(USER_NAME, ADMIN);
        subject = makeSubject(NAME);

        reset(mockCryptoService);
        reset(mockUserDao);
        reset(mockSession);
        reset(mockPasswordService);
        reset(mockSessionFactoryFactory);
        reset(mockTransaction);

        expect(mockSessionFactoryFactory.openSession()).andStubReturn(mockSession);
        expect(mockSession.beginTransaction()).andStubReturn(mockTransaction);

        wire(userService, "cryptoService", mockCryptoService);
        wire(userService, "sessionFactory", mockSessionFactoryFactory);
        wire(userService, "userDao", mockUserDao);
        wire(userService, "setupService", setupService);
        wire(userService, "passwordService", mockPasswordService);

        replay(mockSessionFactoryFactory);
        replay(mockTransaction);
    }

    /**
     * verify the expected things happened
     */
    @After
    public void verifyMocks() {
        verify(mockCryptoService);
        verify(mockUserDao);
        verify(mockPasswordService);
    }

    private void replayAll() {
        replay(mockCryptoService);
        replay(mockUserDao);
        replay(mockSession);
        replay(mockPasswordService);
    }

    private X500Name makeSubject(String name) {
        return new X500Name("CN=" + name
                + ",OU=users,OU=passwordManager,DC=jnawk,DC=net,DC=nz");
    }

    /**
     * @throws UserSaveException
     *             nope
     * @throws CertificateException
     *             nope
     * @throws KeyStoreException
     *             nope
     * @throws KeyException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     */
    @Test
    public void createUser_nullExisting_noException() throws UserSaveException,
            CertificateException, KeyStoreException, KeyException,
            DuplicateEntryException {

        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andStubReturn(null);

        replayAll();

        assertEquals(user, userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN));

    }

    /**
     * @throws CertificateException
     *             nope
     * @throws KeyStoreException
     *             nope
     * @throws KeyException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     * @throws UserSaveException
     *             expected
     */
    @Test(expected = UserSaveException.class)
    public void createUser_nullExisting_KeyStoreException() throws CertificateException,
            KeyStoreException, KeyException, DuplicateEntryException, UserSaveException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andThrow(new KeyStoreException());

        replayAll();
        userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN);

    }

    /**
     * @throws CertificateException
     *             nope
     * @throws KeyStoreException
     *             nope
     * @throws KeyException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     * @throws UserSaveException
     *             expected
     */
    @Test(expected = UserSaveException.class)
    public void createUser_nullExisting_CertificateException()
            throws CertificateException, KeyStoreException, KeyException,
            DuplicateEntryException, UserSaveException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andThrow(new CertificateException());

        replayAll();
        userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN);
    }

    /**
     * @throws CertificateException
     *             nope
     * @throws KeyStoreException
     *             nope
     * @throws KeyException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     * @throws UserSaveException
     *             expected
     */
    @Test(expected = UserSaveException.class)
    public void createUser_nullExisting_KeyException() throws CertificateException,
            KeyStoreException, KeyException, DuplicateEntryException, UserSaveException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andThrow(new KeyException());

        replayAll();
        userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN);
    }

    /**
     * @throws CertificateException
     *             nope
     * @throws KeyStoreException
     *             nope
     * @throws KeyException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     * @throws UserSaveException
     *             expected
     */
    @Test(expected = UserSaveException.class)
    public void createUser_nullExisting_DuplicateEntryException()
            throws CertificateException, KeyStoreException, KeyException,
            DuplicateEntryException, UserSaveException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andThrow(new DuplicateEntryException(null));

        replayAll();
        userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN);
    }

    /**
     * @throws UserSaveException
     *             expected
     * @throws KeyStoreException
     *             nope
     */
    @SuppressWarnings("boxing")
    @Test(expected = UserSaveException.class)
    public void createUser_existing_aliasPresent() throws UserSaveException,
            KeyStoreException {

        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(user);
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(true);

        replayAll();

        userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN);

    }

    /**
     * @throws UserSaveException
     *             expected
     * @throws KeyStoreException
     *             nope
     * @throws DuplicateEntryException
     *             nope
     * @throws KeyException
     *             nope
     * @throws CertificateException
     *             nope
     */
    @SuppressWarnings("boxing")
    @Test
    public void createUser_existing_aliasNotPresent() throws UserSaveException,
            KeyStoreException, CertificateException, KeyException,
            DuplicateEntryException {

        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(user);
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(false);
        mockUserDao.deleteUser(mockSession, USER_NAME);
        expectLastCall();
        mockUserDao.saveUser(mockSession, user);
        expectLastCall();
        expect(
                mockCryptoService.generateNewKeysAndAddToKeystore(subject, PASSWORD,
                        USER_NAME)).andStubReturn(null);
        replayAll();
        assertEquals(user, userService.createUser(USER_NAME, NAME, PASSWORD, ADMIN));

    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws NoSuchUserException
     *             expected
     * @throws UserLoadException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = NoSuchUserException.class)
    public void findUser_userNotPresent() throws KeyStoreException, NoSuchUserException,
            UserLoadException {
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(false);
        replayAll();
        userService.findUser(USER_NAME);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws UserLoadException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void findUser_userPresentInKeystore_userNotPresentInDatabase_noAdminPresent()
            throws KeyStoreException, NoSuchUserException, UserLoadException {
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(true);
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        expect(mockCryptoService.getCertificateAliases())
                .andReturn(
                        Arrays.asList(new String[] { setupService.getSystemKey(),
                                BOGUS_USER_NAME }));
        expect(mockUserDao.findUserPrivileges(mockSession, BOGUS_USER_NAME)).andReturn(
                null);
        mockUserDao.saveUser(mockSession, new UserPrivilegesWithEquals(USER_NAME, true));
        expectLastCall();

        replayAll();

        User expectedUser = new User();
        expectedUser.setUsername(USER_NAME);
        expectedUser.setAdmin(true);
        assertTrue(0 == new UserComparator().compare(expectedUser,
                userService.findUser(USER_NAME)));

    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws UserLoadException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void findUser_userPresentInKeystore_userNotPresentInDatabase_adminPresent()
            throws KeyStoreException, NoSuchUserException, UserLoadException {
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(true);
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        expect(mockCryptoService.getCertificateAliases())
                .andReturn(
                        Arrays.asList(new String[] { setupService.getSystemKey(),
                                BOGUS_USER_NAME }));
        expect(mockUserDao.findUserPrivileges(mockSession, BOGUS_USER_NAME)).andReturn(
                new UserPrivilegesWithEquals(BOGUS_USER_NAME, true));

        replayAll();

        User expectedUser = new User();
        expectedUser.setUsername(USER_NAME);
        expectedUser.setAdmin(true);
        assertTrue(0 == new UserComparator().compare(expectedUser,
                userService.findUser(USER_NAME)));

    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws UserLoadException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void findUser_userPresentInKeystore_userPresentInDatabase()
            throws KeyStoreException, NoSuchUserException, UserLoadException {
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andReturn(true);
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(
                new UserPrivilegesWithEquals(USER_NAME, ADMIN));

        replayAll();

        User expectedUser = new User();
        expectedUser.setUsername(USER_NAME);
        expectedUser.setAdmin(ADMIN);
        assertTrue(0 == new UserComparator().compare(expectedUser,
                userService.findUser(USER_NAME)));

    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws NoSuchUserException
     *             not expected
     * @throws UserLoadException
     *             expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = UserLoadException.class)
    public void findUser_throwsKeyStoreException() throws KeyStoreException,
            NoSuchUserException, UserLoadException {
        expect(mockCryptoService.isAliasPresent(USER_NAME)).andThrow(
                new KeyStoreException());

        replayAll();

        userService.findUser(USER_NAME);
    }

    /**
     * @throws NoSuchUserException
     *             expected
     */
    @Test(expected = NoSuchUserException.class)
    public void isAdminUser_noUser() throws NoSuchUserException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(null);
        replayAll();
        userService.isAdminUser(USER_NAME);
    }

    /**
     * @throws NoSuchUserException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void isAdminUser_user() throws NoSuchUserException {
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(
                new UserPrivilegesWithEquals(USER_NAME, ADMIN));
        replayAll();
        assertEquals(ADMIN, userService.isAdminUser(USER_NAME));
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserLoadException
     *             unexpected
     */
    @Test
    public void listUsers_noUsers() throws KeyStoreException, UserLoadException {
        expect(mockCryptoService.getCertificateAliases()).andReturn(
                new ArrayList<String>());
        replayAll();
        List<User> users = userService.listUsers();
        assertEquals(0, users.size());
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserLoadException
     *             expected
     */
    @Test(expected = UserLoadException.class)
    public void listUsers_keystoreException() throws KeyStoreException, UserLoadException {
        expect(mockCryptoService.getCertificateAliases()).andThrow(
                new KeyStoreException());
        replayAll();
        userService.listUsers();
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserLoadException
     *             unexpected
     */
    @SuppressWarnings("boxing")
    @Test
    public void listUsers_userNotPresent() throws KeyStoreException, UserLoadException {
        expect(mockCryptoService.getCertificateAliases()).andReturn(
                Lists.newArrayList(setupService.getSystemKey(), BOGUS_USER_NAME));
        expect(mockUserDao.findUserPrivileges(mockSession, BOGUS_USER_NAME)).andReturn(
                null);
        replayAll();
        List<User> users = userService.listUsers();
        assertEquals(1, users.size());
        User firstUser = users.get(0);
        assertEquals(BOGUS_USER_NAME, firstUser.getUsername());
        assertFalse(firstUser.isAdmin());
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserLoadException
     *             unexpected
     */
    @SuppressWarnings("boxing")
    @Test
    public void listUsers_userPresent() throws KeyStoreException, UserLoadException {
        expect(mockCryptoService.getCertificateAliases()).andReturn(
                Lists.newArrayList(setupService.getSystemKey(), USER_NAME));
        expect(mockUserDao.findUserPrivileges(mockSession, USER_NAME)).andReturn(
                new UserPrivilegesWithEquals(USER_NAME, ADMIN));
        replayAll();
        List<User> users = userService.listUsers();
        assertEquals(1, users.size());
        User firstUser = users.get(0);
        assertEquals(USER_NAME, firstUser.getUsername());
        assertEquals(firstUser.isAdmin(), ADMIN);
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserDeleteException
     *             unexpected
     */
    @Test
    public void deleteUser_ok() throws KeyStoreException, UserDeleteException {
        mockUserDao.deleteUser(mockSession, USER_NAME);
        expectLastCall();
        mockCryptoService.deleteCertificate(USER_NAME);
        expectLastCall();
        replayAll();
        userService.deleteUser(USER_NAME);
    }

    /**
     * @throws KeyStoreException
     *             unexpected
     * @throws UserDeleteException
     *             expected
     */
    @Test(expected = UserDeleteException.class)
    public void deleteUser_exception() throws KeyStoreException, UserDeleteException {
        mockUserDao.deleteUser(mockSession, USER_NAME);
        expectLastCall();
        mockCryptoService.deleteCertificate(USER_NAME);
        expectLastCall().andThrow(new KeyStoreException());
        replayAll();
        userService.deleteUser(USER_NAME);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws EncryptionException
     *             not expected
     * @throws LoginException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void isCredentialsCorrect_encrypted_ok() throws KeyStoreException,
            EncryptionException, LoginException {
        expect(
                mockPasswordService.isPasswordCorrect(eq(USER_NAME),
                        aryEq(PASSWORD.getBytes()))).andReturn(true);
        replayAll();
        assertTrue(userService.isCredentialsCorrect(USER_NAME, ENCODED_PASSWORD, true));
    }

    /**
     * @throws LoginException
     *             not expected
     */
    @SuppressWarnings("boxing")
    @Test
    public void isCredentialsCorrect_notEncrypted_ok() throws LoginException {
        expect(mockPasswordService.isPasswordCorrect(USER_NAME, PASSWORD))
                .andReturn(true);
        replayAll();
        assertTrue(userService.isCredentialsCorrect(USER_NAME, PASSWORD, false));
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws EncryptionException
     *             not expected
     * @throws LoginException
     *             expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = LoginException.class)
    public void isCredentialsCorrect_encrypted_keystoreException()
            throws KeyStoreException, EncryptionException, LoginException {
        expect(
                mockPasswordService.isPasswordCorrect(eq(USER_NAME),
                        aryEq(PASSWORD.getBytes()))).andThrow(new KeyStoreException());
        replayAll();
        userService.isCredentialsCorrect(USER_NAME, ENCODED_PASSWORD, true);
    }

    /**
     * @throws KeyStoreException
     *             not expected
     * @throws EncryptionException
     *             not expected
     * @throws LoginException
     *             expected
     */
    @SuppressWarnings("boxing")
    @Test(expected = LoginException.class)
    public void isCredentialsCorrect_encrypted_EncryptionException()
            throws KeyStoreException, EncryptionException, LoginException {
        expect(
                mockPasswordService.isPasswordCorrect(eq(USER_NAME),
                        aryEq(PASSWORD.getBytes()))).andThrow(
                new EncryptionException("", new RuntimeException()));
        replayAll();
        userService.isCredentialsCorrect(USER_NAME, ENCODED_PASSWORD, true);
    }

}
