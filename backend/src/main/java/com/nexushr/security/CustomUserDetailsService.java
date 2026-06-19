package com.nexushr.security;

import com.nexushr.auth.model.Delegation;
import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.DelegationRepository;
import com.nexushr.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DelegationRepository delegationRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email));

        Set<com.nexushr.auth.model.Role> allRoles = user.getUserRoles().stream()
                .map(com.nexushr.auth.model.UserRole::getRole)
                .collect(Collectors.toSet());
        
        // Add roles from active delegations
        List<Delegation> activeDelegations = delegationRepository.findActiveDelegationsForDelegatee(user.getId(), java.time.LocalDateTime.now());
        
        for (Delegation delegation : activeDelegations) {
            allRoles.add(delegation.getRole());
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(getAuthorities(allRoles))
                .accountExpired(false)
                .accountLocked(!user.isActive())
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
    }
    private Collection<SimpleGrantedAuthority> getAuthorities(Set<com.nexushr.auth.model.Role> roles) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        
        for (com.nexushr.auth.model.Role role : roles) {
            // Add the Role name itself for backward compatibility
            if (role.getName() != null) {
                authorities.add(new SimpleGrantedAuthority(role.getName()));
            }
            
            // Add granular permissions, traversing up the hierarchy
            com.nexushr.auth.model.Role currentRole = role;
            while (currentRole != null) {
                if (currentRole.getRolePermissions() != null) {
                    currentRole.getRolePermissions().forEach(rp -> {
                        authorities.add(new SimpleGrantedAuthority(rp.getPermission().getAuthorityString()));
                    });
                }
                currentRole = currentRole.getParentRole();
            }
        }
        
        return authorities;
    }
}
