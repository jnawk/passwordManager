package nz.net.jnawk.passwordManager;

import java.util.Comparator;

import nz.net.jnawk.passwordManager.entity.EncryptedPassword;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Compares encrypted passwords
 *
 * @author philip
 */
public class EncryptedPasswordComparator implements Comparator<EncryptedPassword> {
    private static final Logger logger = LoggerFactory
            .getLogger(EncryptedPasswordComparator.class);

    @Override
    public int compare(EncryptedPassword o1, EncryptedPassword o2) {
        int usernameCompare = o1.getUsername().compareTo(o2.getUsername());
        if (0 != usernameCompare) {
            return usernameCompare;
        }
        logger.debug("Usernames are the same");
        int passwordIdCompare = new String(o1.getPasswordId()).compareTo(new String(o2
                .getPasswordId()));
        if (0 != passwordIdCompare) {
            return passwordIdCompare;
        }
        logger.debug("Password IDs are the same");
        int passwordUserIdCompare = new String(o1.getPasswordUserId())
        .compareTo(new String(o2.getPasswordUserId()));
        if (0 != passwordUserIdCompare) {
            return passwordUserIdCompare;
        }
        logger.debug("Password User IDs are the same");
        int passwordDescriptionCompare = new String(o1.getPasswordDescription())
        .compareTo(new String(o2.getPasswordDescription()));
        if (0 != passwordDescriptionCompare) {
            return passwordDescriptionCompare;
        }
        logger.debug("Password Descriptions are the same");
        return new String(o1.getPasswordValue()).compareTo(new String(o2
                .getPasswordValue()));
    }

}
