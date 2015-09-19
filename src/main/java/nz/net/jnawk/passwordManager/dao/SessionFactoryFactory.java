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
package nz.net.jnawk.passwordManager.dao;

import java.io.IOException;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.service.UnknownServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.AbstractDriverBasedDataSource;
import org.springframework.orm.hibernate4.LocalSessionFactoryBean;
import org.springframework.stereotype.Component;

/**
 * @author philip
 */
@Component
public class SessionFactoryFactory {
	private static final Logger logger = LoggerFactory
			.getLogger(SessionFactoryFactory.class);
	static {
		logger.debug("loaded");
	}
	@Autowired
	private LocalSessionFactoryBean sessionFactoryBean;

	@Autowired
	private AbstractDriverBasedDataSource dataSource;

	private static SessionFactory sessionFactory;

	private SessionFactory getSessionFactory() {
		if (null == sessionFactory) {
			sessionFactory = sessionFactoryBean.getObject();
		}
		return sessionFactory;
	}

	/**
	 * @return session, obtained from the privately held session factory
	 */
	public Session openSession() {
		return getSessionFactory().openSession();
	}

	/**
	 * @throws IOException
	 *             if something went wrong
	 */
	public void updateDataSourceUrl() throws IOException {
		sessionFactory.close();
		sessionFactory = null;
		sessionFactoryBean.afterPropertiesSet();
	}

	/**
	 * called when the sesion factory factory is destroyed
	 */
	public void destroy() {
		shutdownDatabase();
	}

	/**
	 * shuts down the database
	 */
	public static void shutdownDatabase() {
		logger.debug("destroy");
		if (null != sessionFactory) {
			try {
				sessionFactory.openSession().createSQLQuery("SHUTDOWN")
						.executeUpdate();
			} catch (UnknownServiceException e) {
				logger.trace(e.getMessage(), e);
			}
			sessionFactory.close();
		}
	}

}
