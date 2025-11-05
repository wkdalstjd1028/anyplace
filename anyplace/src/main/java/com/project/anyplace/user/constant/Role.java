package com.project.anyplace.user.constant;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    GUEST("ROLE_GUEST"),
    HOST("ROLE_HOST"),
    ADMIN("ROLE_ADMIN");

    private final String key;
}
