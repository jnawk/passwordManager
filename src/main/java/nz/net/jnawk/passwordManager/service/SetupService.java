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
package nz.net.jnawk.passwordManager.service;

import java.io.File;
import java.io.IOException;
import java.security.KeyException;
import java.security.KeyStoreException;
import java.security.cert.CertificateException;

import nz.net.jnawk.crypto.CryptoService;
import nz.net.jnawk.crypto.DuplicateEntryException;
import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;
import nz.net.jnawk.passwordManager.webapp.PropertySetter;

import org.bouncycastle.asn1.x500.X500Name;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Service;

/**
 * @author philip
 */
// FIXME this is almost an exact copy of PropertySetter
@Service
public class SetupService extends SetupServiceConfigurationBean implements SmartLifecycle {
    private static final Logger logger = LoggerFactory.getLogger(SetupService.class);

    private boolean running = false;

    @Autowired
    private SessionFactoryFactory sessionFactoryFactory;

    @Autowired
    private CryptoService cryptoService;

    // default location
    private File configurationLocation = new File(System.getProperty("user.home")
            + File.separator + ".nz.net.jnawk.passwordManager");

    private String errors;

    /**
     * @return the db location
     */
    public String getLocation() {
        return configurationLocation.getAbsolutePath();
    }

    /**
     * @return the error message of any error encountered during setup
     */
    public String getErrors() {
        return errors;
    }

    @Override
    public void start() {
        try {
            logger.debug("Setup Service starting...");

            if (running) {
                return;
            }
            boolean dbSetupDone = false;
            String location = getLocation();
            logger.debug("Here we find location to be {}", location);
            String systemLocation = System
                    .getProperty(PropertySetter.DB_PATH_ROOT_PROPERTY);
            if (location.equals(systemLocation)) {
                dbSetupDone = true;
            } else if (null != systemLocation) {
                logger.debug("System location is {}", systemLocation);
                configurationLocation = new File(systemLocation);
            }
            if (configurationLocation.exists()) {
                if (configurationLocation.isDirectory()) {
                    if (!configurationLocation.canWrite()) {
                        logger.error("Directory {} exists but is not writable", location);
                        throw new SetupException("Directory exists, but is not writable");
                    }
                } else {
                    logger.error("{} exists, but it is a file", location);
                    throw new SetupException("Location exists, but it is a file!");
                }
            } else {
                if (!configurationLocation.mkdirs()) {
                    logger.error("{} does not exist, and could not be created", location);
                    throw new SetupException(
                            "Directory does not exist, and could not be created");
                }
            }
            if (!dbSetupDone) {
                sessionFactoryFactory.openSession().createSQLQuery("SHUTDOWN")
                        .executeUpdate();
                PropertySetter.setDBLocation(location);
                sessionFactoryFactory.updateDataSourceUrl();
            }
            String systemKeyAlias = getSystemKey();
            cryptoService.setKeystoreLocation(location + File.separator
                    + getKeystoreName());
            if (!cryptoService.isAliasPresent(systemKeyAlias)) {
                X500Name name = new X500Name(
                        "CN=System,OU=passwordManager,DC=jnawk,DC=net,DC=nz");
                cryptoService.generateNewKeysAndAddToKeystore(name,
                        getSystemKeyPassword(), systemKeyAlias);
            }

            running = true;
        } catch (CertificateException | KeyStoreException | KeyException | SetupException
                | IOException | DuplicateEntryException e) {
            logger.error("Caught a {} while starting the setup service: {}", e.getClass()
                    .getSimpleName(), e.getMessage(), e);
            errors = e.getMessage();
        }
    }

    @Override
    public void stop() {
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 0;
    }

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public void stop(Runnable callback) {
        stop();
        callback.run();
    }
}
