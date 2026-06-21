import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "Admin@123";
        String encodedPassword = "$2b$10$ZOzD4VQPsuPbcjCVNETtaunmw4/VcgCsOPtEL.aEq0pdr9O.T/lRi";
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Matches: " + matches);
    }
}
