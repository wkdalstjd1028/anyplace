package com.project.anyplace.wishlist.service;

import com.project.anyplace.space.entity.Space;
import com.project.anyplace.space.repository.SpaceRepository;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import com.project.anyplace.wishlist.dto.WishlistResponse;
import com.project.anyplace.wishlist.entity.Wishlist;
import com.project.anyplace.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;

    public boolean toggleWishlist(Long userId, Long spaceId) {
        if (wishlistRepository.existsByUserIdAndSpaceId(userId, spaceId)) {
            wishlistRepository.deleteByUserIdAndSpaceId(userId, spaceId);
            return false;
        } else {
            User user = userRepository.getReferenceById(userId);
            Space space = spaceRepository.getReferenceById(spaceId);
            Wishlist wishlist = new Wishlist(user, space);
            wishlistRepository.save(wishlist);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<Long> getMyWishlistSpaceIds(Long userId) {
        return wishlistRepository.findSpaceIdsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Page<WishlistResponse> getMyWishlist(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return wishlistRepository.findByUserId(userId, pageable)
                .map(WishlistResponse::new);
    }
}