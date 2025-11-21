package com.project.anyplace.user.service;

import com.project.anyplace.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class UserPrincipal implements OAuth2User, OidcUser {

    private final User user;
    private final OidcUser oidcUser;
    private final OAuth2User oauth2User;

    private UserPrincipal(User user, OidcUser oidcUser, OAuth2User oauth2User) {
        this.user = user;
        this.oidcUser = oidcUser;
        this.oauth2User = oauth2User;
    }

    public static UserPrincipal create(User user, OidcUser oidcUser) {
        return new UserPrincipal(user, oidcUser, null);
    }

    public static UserPrincipal create(User user, OAuth2User oauth2User) {
        return new UserPrincipal(user, null, oauth2User);
    }

    public Long getUserId() {
        return this.user.getId();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return (oauth2User != null) ? oauth2User.getAttributes() : oidcUser.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey()));
    }

    @Override
    public String getName() {
        return (oauth2User != null) ? oauth2User.getName() : oidcUser.getName();
    }

    @Override
    public Map<String, Object> getClaims() {
        return (oidcUser != null) ? oidcUser.getClaims() : null;
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return (oidcUser != null) ? oidcUser.getUserInfo() : null;
    }

    @Override
    public OidcIdToken getIdToken() {
        return (oidcUser != null) ? oidcUser.getIdToken() : null;
    }
}