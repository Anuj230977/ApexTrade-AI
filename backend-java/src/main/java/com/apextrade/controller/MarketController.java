package com.apextrade.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final RestTemplate restTemplate;
    private final String pythonServiceUrl;

    public MarketController(RestTemplate restTemplate,
                            @Value("${python.service.url}") String pythonServiceUrl) {
        this.restTemplate = restTemplate;
        this.pythonServiceUrl = pythonServiceUrl;
    }

    @GetMapping("/price/{symbol}")
    public Object getPrice(@PathVariable String symbol) {
        return restTemplate.getForObject(pythonServiceUrl + "/price/" + symbol, Object.class);
    }

    @GetMapping("/history/{symbol}")
    public Object getHistory(@PathVariable String symbol,
                             @org.springframework.web.bind.annotation.RequestParam(defaultValue="1mo") String period,
                             @org.springframework.web.bind.annotation.RequestParam(defaultValue="1d") String interval) {
        String url = pythonServiceUrl + "/history/" + symbol + "?period=" + period + "&interval=" + interval;
        return restTemplate.getForObject(url, Object.class);
    }

    @GetMapping("/signal/{symbol}")
    public Object getSignal(@PathVariable String symbol) {
        return restTemplate.getForObject(pythonServiceUrl + "/signal/" + symbol, Object.class);
    }
}