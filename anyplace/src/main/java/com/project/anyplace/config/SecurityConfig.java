package com.project.anyplace.config;

// (다른 import...)
import com.project.anyplace.user.service.CustomOidcUserService; // (추가)
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // (추가) final 필드 주입용
public class SecurityConfig {

    // (추가) 우리가 만든 OIDC 서비스 주입
    private final CustomOidcUserService customOidcUserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/api/spaces", "/api/spaces/**").permitAll()
                        .requestMatchers("/api/me").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .requestMatchers("/", "/error", "/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                // ★★★ OIDC 로그인 설정 수정 ★★★
                .oauth2Login(oauth2 -> oauth2
                        // 1. 로그인 성공 시 React로 리디렉션
                        .defaultSuccessUrl("http://localhost:3000", true)
                        // 2. (필수) 우리가 만든 CustomOidcUserService를 사용하도록 설정
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(customOidcUserService)
                        )
                )
                // ★★★ 로그아웃 설정 추가 ★★★
                .logout(logout -> logout
                        // React의 handleLogout()이 호출할 URL
                        .logoutUrl("/logout")
                        // 로그아웃 성공 시 React 홈으로 리디렉션
                        .logoutSuccessUrl("http://localhost:3000")
                        .deleteCookies("JSESSIONID") // 세션 쿠키 삭제
                        .invalidateHttpSession(true) // 세션 무효화
                );

        return http.build();
    }
}