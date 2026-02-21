package com.pos.repository;

import com.pos.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionTypeRepository extends JpaRepository<TransactionType, Integer> {

    Optional<TransactionType> findByTypeCode(String typeCode);
}
