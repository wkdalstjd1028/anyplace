package com.project.anyplace.user.service;


import com.project.anyplace.user.constant.Role;
import com.project.anyplace.user.dto.UserDTO;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO.UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("id를 찾을 수 없습니다. " + userId));

        return UserDTO.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRoleKey())
                .build();
    }

    @Transactional
    public void upgradeToHost(Long userId, UserDTO.HostUpgradeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("id를 찾을 수 없습니다. " + userId));

        if (user.getRole() == Role.HOST) {
            throw new IllegalStateException("이미 호스트 권한을 가지고 있습니다.");
        }

        user.setRole(Role.HOST);
    }
}
