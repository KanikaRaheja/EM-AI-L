package com.email.writer.jpa;


import lombok.Data;

import lombok.NoArgsConstructor;
public class EmailRequest {
    private String emailContent;
    private String tone;

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
