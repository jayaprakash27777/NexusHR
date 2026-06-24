package com.nexushr;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Hash {
    public static void main(String[] args) {
        System.out.println("HASH_IS:" + new BCryptPasswordEncoder().encode("123456"));
    }
}
