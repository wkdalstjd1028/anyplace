package com.project.anyplace.wishlist.dto;

import com.project.anyplace.wishlist.entity.Wishlist;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class WishlistResponse {
    private final Long id;
    private final Long spaceId;
    private final String spaceName;
    private final String spaceAddress;
    private final Integer pricePerHour;
    private final String mainImageUrl;
    private final LocalDateTime createdAt;

    public WishlistResponse(Wishlist wishlist) {
        this.id = wishlist.getId();
        this.spaceId = wishlist.getSpace().getId();
        this.spaceName = wishlist.getSpace().getName();
        this.spaceAddress = wishlist.getSpace().getAddress();
        this.pricePerHour = wishlist.getSpace().getPricePerHour();
        this.mainImageUrl = wishlist.getSpace().getMainImageUrl();
        this.createdAt = wishlist.getCreatedAt();
    }
}