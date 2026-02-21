package com.pos.service;

import com.pos.domain.User;
import com.pos.dto.LoginRequest;
import com.pos.dto.LoginResponse;
import com.pos.repository.UserRepository;
import com.pos.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        if (!user.getIsActive()) {
            throw new BadCredentialsException("User is inactive");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        String role = user.getRole().getRoleName().toUpperCase();
        String token = tokenProvider.generateToken(user.getUsername(), role);
        Instant expiresAt = Instant.now().plusMillis(tokenProvider.getExpirationMs());
        String expiresAtStr = DateTimeFormatter.ISO_INSTANT.format(expiresAt);
        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(role)
                .expiresAt(expiresAtStr)
                .build();
    }
}
