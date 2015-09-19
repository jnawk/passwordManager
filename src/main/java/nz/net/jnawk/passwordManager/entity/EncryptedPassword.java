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
package nz.net.jnawk.passwordManager.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

/**
 * password entry
 * 
 * @author philip
 */
@Entity
public class EncryptedPassword implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column
    private String passwordId;

    @Column
    @Lob
    private byte[] passwordUserId;

    @Column
    @Lob
    private byte[] passwordValue;

    @Column
    @Lob
    private byte[] passwordDescription;

    @Column
    private String username;

    /**
     * @return the username of the user this password belongs to
     */
    public String getUsername() {
        return username;
    }

    /**
     * @param username
     *            the username of the user this password belongs to
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return the id of the password
     */
    public String getPasswordId() {
        return passwordId;
    }

    /**
     * @param passwordId
     *            the id of the password
     */
    public void setPasswordId(String passwordId) {
        this.passwordId = passwordId;
    }

    /**
     * @return the value of the password (encrypted)
     */
    public byte[] getPasswordValue() {
        return passwordValue;
    }

    /**
     * @param passwordValue
     *            the value of the password to set (encrypted)
     */
    public void setPasswordValue(byte[] passwordValue) {
        this.passwordValue = passwordValue;
    }

    /**
     * @return the user id associated with the password value (encrypted)
     */
    public byte[] getPasswordUserId() {
        return passwordUserId;
    }

    /**
     * @param passwordUserId
     *            the user id associated with this password (encrypted)
     */
    public void setPasswordUserId(byte[] passwordUserId) {
        this.passwordUserId = passwordUserId;
    }

    /**
     * @return the description of the password value (encrypted)
     */
    public byte[] getPasswordDescription() {
        return passwordDescription;
    }

    /**
     * @param passwordDescription
     *            the description of this password value (encrypted)
     */
    public void setPasswordDescription(byte[] passwordDescription) {
        this.passwordDescription = passwordDescription;
    }

}
