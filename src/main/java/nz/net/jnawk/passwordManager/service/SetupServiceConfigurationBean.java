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

/**
 * Hides the spring stuff
 *
 * @author philip
 */
public class SetupServiceConfigurationBean {
    private String keystoreName = "keystore.jks";
    private String systemKey = "system";
    private String systemKeyPassword = "xzNmnTzCCtwccLFzcWqiWWtWmwtsz74WokWCH3kdrKRKu7XcVzPXuCuyUerUTagkf399MUEskkzWUvtpEYYjWCakJpzihohRUohTiF3md99K7yeLshrPxkNjejPdrUgr";

    /**
     * @return the keystoreName
     */
    protected String getKeystoreName() {
        return keystoreName;
    }

    /**
     * @param keystoreName
     *            the keystoreName to set
     */
    public void setKeystoreName(String keystoreName) {
        this.keystoreName = keystoreName;
    }

    /**
     * @return the systemkey
     */
    public String getSystemKey() {
        return systemKey;
    }

    /**
     * @param systemkey
     *            the systemkey to set
     */
    public void setSystemKey(String systemkey) {
        this.systemKey = systemkey;
    }

    /**
     * @return the systemKeyPassword
     */
    public String getSystemKeyPassword() {
        return systemKeyPassword;
    }

    /**
     * @param systemKeyPassword
     *            the systemKeyPassword to set
     */
    public void setSystemKeyPassword(String systemKeyPassword) {
        if (null == systemKeyPassword) {
            throw new IllegalArgumentException("Key password cannot be null");
        }
        this.systemKeyPassword = systemKeyPassword;
    }

}
