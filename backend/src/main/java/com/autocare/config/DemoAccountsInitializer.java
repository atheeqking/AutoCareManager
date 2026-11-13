package com.autocare.config;

import com.autocare.repository.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Flyway seeds three demo workshop accounts with a documented password. They stay disabled unless
 * {@code app.security.demo-accounts} (env {@code DEMO_ACCOUNTS_ENABLED}) is true, so a deployment
 * that forgets to remove them is not exposed.
 */
@Component
public class DemoAccountsInitializer implements ApplicationRunner {
    static final List<String> DEMO_USERNAMES =
            List.of("owner@autocare.com", "manager@autocare.com", "employee@autocare.com");
    private static final Logger log = LoggerFactory.getLogger(DemoAccountsInitializer.class);
    private final UserRepository users;
    private final boolean demoAccountsEnabled;

    public DemoAccountsInitializer(
            UserRepository users,
            @Value("${app.security.demo-accounts:false}") boolean demoAccountsEnabled) {
        this.users = users;
        this.demoAccountsEnabled = demoAccountsEnabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        DEMO_USERNAMES.forEach(
                username ->
                        users.findByUsername(username)
                                .ifPresent(user -> user.setEnabled(demoAccountsEnabled)));
        if (demoAccountsEnabled)
            log.warn(
                    "Demo workshop accounts are ENABLED. Set DEMO_ACCOUNTS_ENABLED=false outside local development.");
        else log.info("Demo workshop accounts are disabled.");
    }
}
