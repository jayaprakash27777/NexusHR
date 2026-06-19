package com.nexushr.auth.service;

import com.nexushr.auth.dto.RoleDto;
import com.nexushr.auth.model.Role;
import com.nexushr.auth.model.enums.RoleType;
import com.nexushr.auth.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class AuthorizationAdminServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthorizationAdminServiceImpl authorizationAdminService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRoleHierarchy() {
        Role grandParent = new Role();
        grandParent.setId(1L);
        grandParent.setName("SUPER_ADMIN");
        grandParent.setRoleType(RoleType.SYSTEM_ADMIN);

        Role parent = new Role();
        parent.setId(2L);
        parent.setName("ADMIN");
        parent.setParentRole(grandParent);
        parent.setRoleType(RoleType.SYSTEM_ADMIN);

        Role child = new Role();
        child.setId(3L);
        child.setName("MANAGER");
        child.setParentRole(parent);
        child.setRoleType(RoleType.CUSTOM);

        when(roleRepository.findById(3L)).thenReturn(Optional.of(child));

        List<RoleDto> hierarchy = authorizationAdminService.getRoleHierarchy(3L);

        assertNotNull(hierarchy);
        assertEquals(3, hierarchy.size());
        assertEquals("MANAGER", hierarchy.get(0).getName());
        assertEquals("ADMIN", hierarchy.get(1).getName());
        assertEquals("SUPER_ADMIN", hierarchy.get(2).getName());
    }
}
