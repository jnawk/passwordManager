package nz.net.jnawk.passwordManager.webapp;

import static nz.net.bafonline.manualAutowireTools.Wire.wire;
import static org.easymock.EasyMock.createStrictMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import net.sf.uadetector.ReadableUserAgent;
import net.sf.uadetector.UserAgentStringParser;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.cache.Cache;

/**
 * Test the CachedUserAgentStringParser
 *
 * @author philip
 */
public class UserAgentParserTest {
    private Cache<String, ReadableUserAgent> mockCache;
    private UserAgentStringParser mockParser;
    private ReadableUserAgent mockReadableUserAgent;
    private CachedUserAgentStringParser parser;

    private final String USER_AGENT_STRING = "foo";

    /**
     * @throws NoSuchFieldException
     *             if wiring problem
     * @throws SecurityException
     *             if wiring problem
     * @throws IllegalArgumentException
     *             if wiring problem
     * @throws IllegalAccessException
     *             if wiring problem
     */
    @SuppressWarnings("unchecked")
    @Before
    public void setup() throws NoSuchFieldException, SecurityException,
    IllegalArgumentException, IllegalAccessException {

        mockCache = createStrictMock(Cache.class);
        mockParser = createStrictMock(UserAgentStringParser.class);
        mockReadableUserAgent = createStrictMock(ReadableUserAgent.class);

        reset(mockCache);
        reset(mockParser);
        reset(mockReadableUserAgent);

        parser = new CachedUserAgentStringParser();
        wire(parser, "cache", mockCache);
        wire(parser, "parser", mockParser);

    }

    /**
     * verify all the things that were expected happened
     */
    @After
    public void verifyMocks() {
        verify(mockCache);
        verify(mockParser);
        verify(mockReadableUserAgent);
    }

    /**
     * tests when the agent string is not present in the cache that the result
     * is put in the cache
     */
    @Test
    public void notPresent() {

        expect(mockCache.getIfPresent(USER_AGENT_STRING)).andReturn(null);
        expect(mockParser.parse(USER_AGENT_STRING)).andReturn(mockReadableUserAgent);
        EasyMock.expect(mockReadableUserAgent.getTypeName()).andStubReturn(
                USER_AGENT_STRING);
        mockCache.put(USER_AGENT_STRING, mockReadableUserAgent);
        expectLastCall();

        replay(mockCache);
        replay(mockParser);
        replay(mockReadableUserAgent);

        parser.parse(USER_AGENT_STRING);

    }

    /**
     * tests when the agent string is present in the cache that the result
     * from the cache is returned
     */
    @Test
    public void present() {
        expect(mockCache.getIfPresent(USER_AGENT_STRING))
        .andReturn(mockReadableUserAgent);

        replay(mockCache);
        replay(mockParser);
        replay(mockReadableUserAgent);

        parser.parse(USER_AGENT_STRING);
    }
}
