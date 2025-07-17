package com.email.writer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EmailWriterSbApplication {

	public static void main(String[] args) {
		System.out.println("Starting Email Writer Spring Boot Application...");
		SpringApplication.run(EmailWriterSbApplication.class, args);
	}

}
