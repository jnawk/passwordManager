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

import java.io.File;

import javax.annotation.Nonnull;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import nz.net.jnawk.passwordManager.dao.SessionFactoryFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Listener to set the context's temp path as a system property, so HSQLdb can
 * use it.
 *
 * @author philip
 */
// FIXME this is almost an exact copy of SetupService
public class PropertySetter implements ServletContextListener {
    private static Logger logger = LoggerFactory.getLogger(PropertySetter.class);
    /**
     * property that holds the location of the database
     */
    public static final String DB_PATH_ROOT_PROPERTY = "nz.net.jnawk.passwordManager.dbPathRoot";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        final String TEMP_PATH_PROPERTY = "javax.servlet.context.tempdir";
        final String TEMP_PATH_ROOT = ((File) sce.getServletContext().getAttribute(
                TEMP_PATH_PROPERTY)).getAbsolutePath();

        String contextPath = sce.getServletContext().getContextPath();

        File configurationLocation = new File(System.getProperty("user.home")
                + File.separator + ".nz.net.jnawk.passwordManager" + File.separator
                + contextPath);

        String location = configurationLocation.getAbsolutePath();

        boolean setupGood = false;
        if (configurationLocation.exists()) {
            if (configurationLocation.isDirectory()) {
                if (!configurationLocation.canWrite()) {
                    logger.error("Directory {} exists but is not writable", location);
                } else {
                    setupGood = true;
                }
            } else {
                logger.error("{} exists, but it is a file", location);
            }
        } else {
            if (!configurationLocation.mkdirs()) {
                logger.error("{} does not exist, and could not be created", location);
            } else {
                setupGood = true;
            }
        }
        if (setupGood) {
            logger.debug("setting property {} to {}", DB_PATH_ROOT_PROPERTY, location);
            setDBLocation(location);
        } else {
            logger.debug("setting property {} to {} (got from {})",
                    DB_PATH_ROOT_PROPERTY, TEMP_PATH_ROOT, TEMP_PATH_PROPERTY);
            setDBLocation(TEMP_PATH_ROOT);
        }
    }

    /**
     * Set the DB location. Is public static so SetupService can call it.
     *
     * @param location
     *            location for the db to go in
     */
    public static void setDBLocation(@Nonnull String location) {
        System.setProperty(DB_PATH_ROOT_PROPERTY, location);

    }

    @Override
    public void contextDestroyed(ServletContextEvent arg0) {
        logger.debug("Shutting down database");
        SessionFactoryFactory.shutdownDatabase();
    }
}
