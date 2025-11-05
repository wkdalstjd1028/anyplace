package com.project.anyplace.config;

import com.project.anyplace.user.service.CustomOAuth2UserService;
import com.project.anyplace.user.service.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
// import org.springframework.security.config.Customizer; // (이제 Customizer.withDefaults() 안 씀)
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration; // ⭐️ Import 추가
import org.springframework.web.cors.CorsConfigurationSource; // ⭐️ Import 추가
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // ⭐️ Import 추가

import java.util.List; // ⭐️ Import 추가

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOidcUserService customOidcUserService;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. ⭐️ CORS 설정을 Bean을 직접 참조하도록 수정 ⭐️
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (POST/PATCH 요청을 위해 필수)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. API 엔드포인트별 접근 권한 설정
                .authorizeHttpRequests(authorize -> authorize
                        // (1) 누구나 접근 가능한 경로
                        .requestMatchers("/", "/error", "/oauth2/**", "/login/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/spaces", "/api/spaces/**").permitAll()

                        // (2) ⭐️ 예약 API: 인증(로그인) 필수 (명시적 추가) ⭐️
                        .requestMatchers("/bookings/**").authenticated()

                        // (3) 기타 인증 필수 경로
                        .requestMatchers("/api/me").authenticated()
                        .requestMatchers("/api/**").authenticated() // (space 등록/수정 등)

                        // (4) 나머지 모든 요청은 인증 필수 (항상 맨 마지막)
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

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("http://localhost:3000")
                        .deleteCookies("JSESSIONID")
                        .invalidateHttpSession(true)
                );

        return http.build();
    }

    // 4. ⭐️ CORS 설정 Bean 추가 ⭐️
    // React(localhost:3000)로부터의 모든 요청(GET, POST, PATCH 등)을 허용합니다.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React 앱의 주소
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // 허용할 HTTP 메서드 (POST, PATCH 등 예약에 필요한 메서드 포함)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용할 헤더
        configuration.setAllowedHeaders(List.of("*"));

        // 쿠키/인증 정보 포함 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 이 설정 적용

        return source;
    }
}