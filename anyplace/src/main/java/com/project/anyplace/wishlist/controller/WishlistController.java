package com.project.anyplace.wishlist.controller;

import com.project.anyplace.user.service.UserPrincipal;
import com.project.anyplace.wishlist.service.WishlistService;
import com.project.anyplace.wishlist.dto.WishlistResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleWishlist(
            @RequestBody Map<String, Long> request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long spaceId = request.get("spaceId");
        boolean added = wishlistService.toggleWishlist(principal.getUserId(), spaceId);

        return ResponseEntity.ok(Collections.singletonMap("added", added));
    }

    @GetMapping("/space-ids")
    public ResponseEntity<List<Long>> getMyWishlistSpaceIds(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Long> spaceIds = wishlistService.getMyWishlistSpaceIds(principal.getUserId());
        return ResponseEntity.ok(spaceIds);
    }

    @GetMapping
    public ResponseEntity<Page<WishlistResponse>> getMyWishlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(wishlistService.getMyWishlist(principal.getUserId(), page, size));
    }
}