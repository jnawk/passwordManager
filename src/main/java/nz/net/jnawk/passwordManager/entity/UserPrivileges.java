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
package nz.net.jnawk.passwordManager.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * @author amy
 */
@Entity
public class UserPrivileges {
    @Id
    @Column
    private String userCode;

    @Column
    private boolean adminUser;

    /**
     * Constructs a new UserPrivileges object
     *
     * @param userCode2
     *            the username
     * @param b
     *            admin status
     */
    public UserPrivileges(String userCode2, boolean b) {
        userCode = userCode2;
        adminUser = b;
    }

    /**
     * constructor for hibernate
     */
    public UserPrivileges() {//
    }

    /**
     * @return the user code for the user
     */

    public String getUserCode() {
        return userCode;
    }

    /**
     * @param userCode
     *            the user code is set
     */
    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    /**
     * @return the adminUser
     */
    public boolean isAdminUser() {
        return adminUser;
    }

    /**
     * @param adminUser
     *            the adminUser to set
     */
    public void setAdminUser(boolean adminUser) {
        this.adminUser = adminUser;
    }

}
