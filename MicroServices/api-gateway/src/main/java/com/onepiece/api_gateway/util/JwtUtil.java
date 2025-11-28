package com.onepiece.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Make sure this property name matches your Gateway's application.properties
    // It must be the SAME secret as in your user-service
    @Value("${spring.jwt.secret}")
    private String secret;

    // Generate a SecretKey from the secret string
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // --- Methods needed by AuthenticationFilter ---

    /**
     * Validates the token's signature and expiration.
     * Throws an exception if validation fails.
     */
    public void validateToken(String token) {
        // Jwts.parser() will throw an exception if the token is invalid
        // (expired, wrong signature, etc.)
        Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
    }

    /**
     * Extracts all claims from the token.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // --- Helper methods (if needed, but validateToken handles expiration) ---

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}