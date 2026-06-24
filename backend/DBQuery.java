import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DBQuery {
    public static void main(String[] args) throws Exception {
        Class.forName("org.postgresql.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5433/nexushr", "nexushr", "nexushr_secret");
             Statement stmt = conn.createStatement()) {
            
            ResultSet rs = stmt.executeQuery("SELECT u.email, r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE r.name != 'ROLE_EMPLOYEE' ORDER BY r.name;");
            
            System.out.println("--- CREDENTIALS ---");
            while (rs.next()) {
                System.out.println("Role: " + rs.getString("name") + " | Email: " + rs.getString("email"));
            }
        }
    }
}
