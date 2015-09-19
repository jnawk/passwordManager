package nz.net.jnawk.passwordManager;

import java.math.BigInteger;

import nz.net.jnawk.passwordManager.entity.UserPrivileges;

/**
 * UserPrivileges with .equals
 *
 * @author philip
 */
public class UserPrivilegesWithEquals extends UserPrivileges {

    /**
     * @param uSER_NAME
     *            passed to super
     * @param aDMIN
     *            passed to super
     */
    public UserPrivilegesWithEquals(String uSER_NAME, boolean aDMIN) {
        super(uSER_NAME, aDMIN);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof UserPrivileges)) {
            return false;
        }
        UserPrivileges up = (UserPrivileges) o;
        if (this == up) {
            return true;
        }
        if (null == getUserCode()) {
            return false;
        }
        if (getUserCode().equals(up.getUserCode()) && isAdminUser() == up.isAdminUser()) {
            return true;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return new BigInteger(new StringBuffer().append(
                new String(getUserCode()).hashCode()).toString()).multiply(
                        new BigInteger(new StringBuffer().append(
                                new Boolean(isAdminUser()).hashCode()).toString())).intValue();
    }
}
