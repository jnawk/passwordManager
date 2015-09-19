/*
 * #%L
 * Password Manager
 * %%
 * Copyright (C) 2013 - 2015 BAF Technologies Limited
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

import java.util.concurrent.TimeUnit;

import net.sf.uadetector.ReadableUserAgent;
import net.sf.uadetector.UserAgentStringParser;
import net.sf.uadetector.service.UADetectorServiceFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.Lifecycle;
import org.springframework.stereotype.Component;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 * User agent parser with cache
 *
 * @author philip
 */
@Component
public class CachedUserAgentStringParser implements UserAgentStringParser, Lifecycle {
    private final static Logger logger = LoggerFactory
            .getLogger(CachedUserAgentStringParser.class);

    private final UserAgentStringParser parser = UADetectorServiceFactory
            .getCachingAndUpdatingParser();
    private final Cache<String, ReadableUserAgent> cache = CacheBuilder.newBuilder()
            .maximumSize(100).expireAfterWrite(20, TimeUnit.DAYS).build();

    private boolean running = true;

    @Override
    public String getDataVersion() {
        return parser.getDataVersion();
    }

    @Override
    public ReadableUserAgent parse(final String userAgentString) {
        ReadableUserAgent result = cache.getIfPresent(userAgentString);
        if (result == null) {
            result = parser.parse(userAgentString);
            logger.info("User-Agent: {} is {}", userAgentString, result.getTypeName());
            cache.put(userAgentString, result);
        }
        return result;
    }

    @Override
    public void shutdown() {
        logger.info("shutting down, apparently...");
        parser.shutdown();
        running = false;
    }

    @Override
    public void start() {
        // don't care
    }

    @Override
    public void stop() {
        shutdown();
    }

    @Override
    public boolean isRunning() {
        return running;
    }

}
