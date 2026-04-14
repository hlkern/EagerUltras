package org.eagerultras.service;

import org.eagerultras.response.SearchItemResponse;

import java.util.List;

public interface SearchService {

    List<SearchItemResponse> search(String q);
}

