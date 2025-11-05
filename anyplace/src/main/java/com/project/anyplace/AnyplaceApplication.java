package com.project.anyplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing; // 1106예약기능

@EnableJpaAuditing // 1106예약기능

@SpringBootApplication
public class AnyplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnyplaceApplication.class, args);
	}

}
