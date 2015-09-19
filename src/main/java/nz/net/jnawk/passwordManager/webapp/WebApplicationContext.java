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

import javax.servlet.FilterRegistration.Dynamic;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.XmlWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * brave new world servlet-3.0 version of web.xml
 *
 * @author philip
 */
public class WebApplicationContext implements WebApplicationInitializer {
    private static final Logger logger = LoggerFactory
            .getLogger(WebApplicationContext.class);
    static {
        logger.debug("loaded");
    }

    @Override
    public void onStartup(ServletContext context) throws ServletException {
        final String path = "/p/*";

        logger.debug("wow!");
        XmlWebApplicationContext applicationContext = new XmlWebApplicationContext();

        /*
         * <listener>
         * <listener-class>
         * nz.net.jnawk.passwordManager.webapp.PropertySetter
         * </listener-class>
         * </listener>
         */
        context.addListener(PropertySetter.class);

        context.addListener(new ContextLoaderListener(applicationContext));

        /*
         * <servlet>
         * <servlet-name>dispatcher</servlet-name>
         * <servlet-class>org.springframework.web.servlet.DispatcherServlet</
         * servlet-class>
         * <init-param>
         * <param-name>contextConfigLocation</param-name>
         * <param-value>classpath:applicationContext.xml</param-value>
         * </init-param>
         * <load-on-startup>1</load-on-startup>
         * </servlet>
         */
        applicationContext.setConfigLocation("classpath:applicationContext.xml");

        ServletRegistration.Dynamic dispatcher = context.addServlet("dispatcher",
                new DispatcherServlet(applicationContext));
        dispatcher.setLoadOnStartup(1);

        /*
         * <servlet-mapping>
         * <servlet-name>dispatcher</servlet-name>
         * <url-pattern>/p/*</url-pattern>
         * </servlet-mapping>
         */
        dispatcher.addMapping(path);

        /*
         * <filter>
         * <filter-name>springSecurityFilterChain</filter-name>
         * <filter-class>org.springframework.web.filter.DelegatingFilterProxy</
         * filter-class>
         * </filter>
         */
        Dynamic filter = context.addFilter("springSecurityFilterChain",
                new DelegatingFilterProxy());

        /*
         * <filter-mapping>
         * <filter-name>springSecurityFilterChain</filter-name>
         * <url-pattern>/p/*</url-pattern>
         * </filter-mapping>
         */
        filter.addMappingForUrlPatterns(null, true, path);

    }
}
