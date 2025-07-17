package com.email.writer.bean;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientBean {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder.build();
    }
}