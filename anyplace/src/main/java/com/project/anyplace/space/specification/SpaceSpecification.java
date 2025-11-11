package com.project.anyplace.space.specification;

import com.project.anyplace.reservation.entity.Reservation;
import com.project.anyplace.space.dto.SpaceSearchRequest;
import com.project.anyplace.space.entity.Space;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class SpaceSpecification {
    public static Specification<Space> build(SpaceSearchRequest request) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(request.getKeyword())) {
                String likePattern = "%" + request.getKeyword() + "%";
                Predicate nameLike = cb.like(root.get("name"), likePattern);
                Predicate descriptionLike = cb.like(root.get("description"), likePattern);
                Predicate addressLike = cb.like(root.get("address"), likePattern);
                predicates.add(cb.or(nameLike, descriptionLike, addressLike));
            }

            if (StringUtils.hasText(request.getCity())) {
                predicates.add(cb.like(root.get("address"), "%" + request.getCity() + "%"));
            }
            if (StringUtils.hasText(request.getDistrict())) {
                predicates.add(cb.like(root.get("address"), "%" + request.getDistrict() + "%"));
            }

            if (StringUtils.hasText(request.getType())) {
                predicates.add(cb.equal(root.get("type"), request.getType()));
            }

            if (request.getMinCapacity() != null && request.getMinCapacity() > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), request.getMinCapacity()));
            }

            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerHour"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerHour"), request.getMaxPrice()));
            }


            if (request.getCheckInDate() != null && request.getCheckOutDate() != null) {

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Reservation> bookingRoot = subquery.from(Reservation.class);

                Predicate overlap = cb.and(
                        cb.lessThan(bookingRoot.get("startDate"), request.getCheckOutDate()),
                        cb.greaterThan(bookingRoot.get("endDate"), request.getCheckInDate())
                );

                Predicate confirmed = cb.equal(bookingRoot.get("status"), "CONFIRMED");

                subquery.select(bookingRoot.get("space").get("id"))
                        .where(overlap, confirmed);

                predicates.add(cb.not(root.get("id").in(subquery)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}