package com.apextrade.service;

import com.apextrade.entity.Portfolio;
import com.apextrade.entity.User;
import com.apextrade.entity.Wallet;
import com.apextrade.repository.PortfolioRepository;
import com.apextrade.repository.UserRepository;
import com.apextrade.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(String username, String email, String rawPassword) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        User savedUser = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUserId(savedUser.getId());
        walletRepository.save(wallet);

        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(savedUser.getId());
        portfolioRepository.save(portfolio);

        return savedUser;
    }
}