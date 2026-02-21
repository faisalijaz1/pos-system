package com.pos.repository;

import com.pos.domain.DeliveryMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryModeRepository extends JpaRepository<DeliveryMode, Integer> {
}
