package com.project.anyplace.space.specification;

import com.project.anyplace.space.dto.SpaceSearchRequest;
import com.project.anyplace.space.entity.Space;
import jakarta.persistence.criteria.Predicate;
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

            if (StringUtils.hasText(request.getRegion())) {
                predicates.add(cb.like(root.get("address"), "%" + request.getRegion() + "%"));
            }

            if (StringUtils.hasText(request.getType())) {
                predicates.add(cb.equal(root.get("type"), request.getType()));
            }

            if (request.getCapacity() != null && request.getCapacity() > 0) {
                // DB의 capacity가 요청한 capacity보다 크거나 같아야 함
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), request.getCapacity()));
            }

            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerHour"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerHour"), request.getMaxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
