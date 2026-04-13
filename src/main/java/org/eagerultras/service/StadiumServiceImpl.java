package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.Stadium;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.response.StadiumResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StadiumServiceImpl implements StadiumService {

    private final StadiumRepository stadiumRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public List<StadiumResponse> getAll() {

        List<Stadium> list = stadiumRepository.findAllBy();

        list.forEach(s ->
                log.info("RAW ENTITY => id={}, name={}", s.getId(), s.getName())
        );

        return list.stream()
                .map(stadiumMapper::toResponse)
                .toList();
    }


    @Override
    public StadiumResponse getById(Long id) {
        Stadium stadium = stadiumRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Stadium not found. id={}", id);
                    return new IllegalArgumentException("Stadium not found");
                });

        return stadiumMapper.toResponse(stadium);
    }
}