package com.email.writer.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.email.writer.jpa.EmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClientResponseException;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
public class EmailService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generateEmailReply(EmailRequest emailreq) {
        String prompt = buildPrompt(emailreq);
        System.out.println("Generated prompt:\n" + prompt);

        Map<String, Object> requestBody = craftRequest(prompt);
        try {
            System.out.println("Crafted JSON body: " + new ObjectMapper().writeValueAsString(requestBody));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        try {
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/gemini-2.0-flash:generateContent")
                            .queryParam("key", "YOUR_API_KEY") // or geminiApiKey
                            .build())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        System.err.println("Gemini API returned error: " + errorBody);
                                        return Mono.error(new RuntimeException("Gemini error: " + errorBody));
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

            System.out.println("Raw Gemini API Response:\n" + response);

            if (response == null || response.isEmpty()) {
                return "Error: Gemini API returned null or empty response.";
            }

            return extractedResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailreq) {
        String tone = (emailreq.getTone() == null || emailreq.getTone().isEmpty()) ? "neutral" : emailreq.getTone();
        return String.format("""
            Generate a professional reply to the following email:
            Email Content: %s
            Use Tone: %s
            Reply:""", emailreq.getEmailContent(), tone);
    }

    public Map<String, Object> craftRequest(String emailContent) {
        Map<String, Object> part = Map.of("text", emailContent);
        Map<String, Object> content = Map.of("parts", List.of(part));
        return Map.of("contents", List.of(content));
    }



    private String extractedResponse(String response) {
        try {
            JsonNode node = new ObjectMapper().readTree(response);

            if (node.has("error")) {
                String errorMessage = node.path("error").path("message").asText();
                throw new RuntimeException("Gemini API returned error: " + errorMessage);
            }

            JsonNode candidates = node.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) {
                throw new RuntimeException("No candidates returned in the response");
            }

            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new RuntimeException("No 'text' content in response");
            }

            return textNode.asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing response: " + e.getMessage();
        }
    }

}
