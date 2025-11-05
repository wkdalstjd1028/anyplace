package com.project.anyplace.user.service;

import com.project.anyplace.user.constant.Role;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        Map<String, Object> attributes = oidcUser.getAttributes();

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        User user = saveOrUpdate(provider, providerId, email, name);

        OidcUserAuthority authority = new OidcUserAuthority(
                user.getRoleKey(),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo()
        );

        String nameAttributeKey = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOidcUser(
                Collections.singleton(authority),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                nameAttributeKey
        );
    }

    private User saveOrUpdate(String provider, String providerId, String email, String name) {
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(entity -> {
                    entity.setName(Optional.ofNullable(name).orElse(entity.getName()));
                    entity.setEmail(Optional.ofNullable(email).orElse(entity.getEmail()));
                    return entity;
                })
                .orElseGet(() -> {
                    return User.builder()
                            .email(Optional.ofNullable(email).orElse(providerId + "@" + provider))
                            .name(Optional.ofNullable(name).orElse("사용자"))
                            .provider(provider)
                            .providerId(providerId)
                            .role(Role.GUEST)
                            .build();
                });

        return userRepository.save(user);
    }
}