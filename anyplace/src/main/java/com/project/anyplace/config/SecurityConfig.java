package com.project.anyplace.config;

import com.project.anyplace.user.service.CustomOAuth2UserService;
import com.project.anyplace.user.service.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher; // (import 문은 그대로 유지)

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOidcUserService customOidcUserService;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())

                // ★★★ (2. CSRF 보호 비활성화 - 404 오류의 근본 원인) ★★★
                // (최신 Spring Security 6+ 방식)
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/api/spaces", "/api/spaces/**").permitAll()
                        .requestMatchers("/api/me").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .requestMatchers("/", "/error", "/oauth2/**", "/login/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("http://localhost:3000", true)
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(customOidcUserService)
                                .userService(customOAuth2UserService)
                        )
                )

                // ★★★ (3. 로그아웃 설정 수정) ★★★
                .logout(logout -> logout
                        // .logoutRequestMatcher(...) (삭제)
                        .logoutUrl("/logout") // React가 호출할 로그아웃 주소
                        .logoutSuccessUrl("http://localhost:3000") // 성공 시 React 홈으로
                        .deleteCookies("JSESSIONID") // 세션 쿠키 삭제
                        .invalidateHttpSession(true) // 세션 무효화
                );

        return http.build();
    }
}