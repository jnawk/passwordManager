package nz.net.jnawk.passwordManager;

import java.util.Comparator;

import nz.net.jnawk.schemas.passwordmanager.User;

/**
 * test class for comparing users
 *
 * @author philip
 */
public class UserComparator implements Comparator<User> {

    @Override
    public int compare(User o1, User o2) {
        return o1.getUsername().compareTo(o2.getUsername());
    }
}
