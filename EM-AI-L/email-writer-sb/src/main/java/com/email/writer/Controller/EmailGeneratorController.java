package com.email.writer.Controller;
import com.email.writer.jpa.EmailRequest;
import com.email.writer.services.EmailService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("api/email")
public class EmailGeneratorController {

    private final EmailService emailService;

    @Autowired
    public EmailGeneratorController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailreq) throws JsonProcessingException {
        System.out.println("Received email request: " + emailreq.getEmailContent());
        String response = emailService.generateEmailReply(emailreq);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Email service is running");
    }
}
