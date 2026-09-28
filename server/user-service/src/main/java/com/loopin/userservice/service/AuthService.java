package com.loopin.userservice.service;

import com.loopin.userservice.config.JwtService;
import com.loopin.userservice.dto.AuthResponse;
import com.loopin.userservice.dto.LoginRequest;
import com.loopin.userservice.dto.RegisterRequest;
import com.loopin.userservice.model.User;
import com.loopin.userservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request){
        if (userRepository.existsByUsername(request.username())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        User user = User.builder()
                .username(request.username())
                .name(request.name())
                .password(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getName(), user.getAvatarGradient());
        return new AuthResponse(token, user.getUsername(), user.getName(), user.getAvatarGradient());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getName(), user.getAvatarGradient());
        return new AuthResponse(token, user.getUsername(), user.getName(), user.getAvatarGradient());
    }
}
