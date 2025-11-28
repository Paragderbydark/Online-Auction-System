package com.GSA.Backend.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;


import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<Integer> {

    @Override
    public Optional<Integer> getCurrentAuditor() {
        // Here you can implement logic to fetch the current user's ID
        // For example, from a security context or session
        // For demonstration, we will return a fixed user ID (e.g., 1)
        return Optional.of(1);
    }
}
