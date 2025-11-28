package com.onepiece.api_gateway.filter;

import com.onepiece.api_gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    public static final String AUTH_USER_ID_HEADER = "X-Auth-User-Id";
    public static final String AUTH_USER_ROLES_HEADER = "X-Auth-User-Roles";

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        super(Config.class);
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            if (validator.isSecured.test(request)) {

                var headers = request.getHeaders();
                List<String> authValues = headers.getOrEmpty(HttpHeaders.AUTHORIZATION);

                if (authValues.isEmpty()) {
                    log.warn("Missing Authorization header for request {}", request.getURI());
                    return setUnauthorizedResponse(response);
                }

                String authHeader = authValues.get(0);
                if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                    log.warn("Invalid Authorization header format for request {}", request.getURI());
                    return setUnauthorizedResponse(response);
                }

                String token = authHeader.substring(7);
                try {
                    jwtUtil.validateToken(token);
                    Claims claims = jwtUtil.extractAllClaims(token);

                    String userIdHeader = null;
                    Object userIdClaim = claims.get("userId");
                    if (userIdClaim == null) {
                        userIdHeader = claims.getSubject();
                    } else {
                        userIdHeader = String.valueOf(userIdClaim);
                    }

                    String rolesHeader = null;
                    Object rolesClaim = claims.get("roles");
                    if (rolesClaim instanceof List) {
                        rolesHeader = ((List<?>) rolesClaim).stream()
                                .map(Object::toString)
                                .collect(Collectors.joining(","));
                    } else if (rolesClaim != null) {
                        rolesHeader = String.valueOf(rolesClaim);
                    } else {
                        rolesHeader = "GUEST";
                    }

                    ServerHttpRequest.Builder mutated = request.mutate()
                            .header(AUTH_USER_ID_HEADER, userIdHeader != null ? userIdHeader : "")
                            .header(AUTH_USER_ROLES_HEADER, rolesHeader);

                    for (Map.Entry<String, Object> entry : claims.entrySet()) {
                        String claimName = entry.getKey();
                        Object value = entry.getValue();
                        if (value == null) continue;

                        String headerName = "X-Auth-Claim-" + claimName;
                        String headerValue;
                        if (value instanceof List) {
                            headerValue = ((List<?>) value).stream()
                                    .map(Object::toString)
                                    .collect(Collectors.joining(","));
                        } else {
                            headerValue = String.valueOf(value);
                        }

                        mutated.header(headerName, headerValue);
                    }

                    ServerHttpRequest modifiedRequest = mutated.build();
                    exchange = exchange.mutate().request(modifiedRequest).build();

                } catch (Exception e) {
                    log.warn("Token validation failed for request {}: {}", request.getURI(), e.getMessage());
                    return setUnauthorizedResponse(response);
                }
            }

            log.debug("Authentication/Authorization Context passed for {}", request.getURI());
            return chain.filter(exchange);
        };
    }

    private reactor.core.publisher.Mono<Void> setUnauthorizedResponse(ServerHttpResponse response) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    public static class Config {
    }
}
