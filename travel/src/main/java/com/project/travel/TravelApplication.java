package com.project.travel;

import com.project.travel.service.MockDataService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@SpringBootApplication
public class TravelApplication {

	public static void main(String[] args) {
		SpringApplication.run(TravelApplication.class, args);
	}

	CommandLineRunner run(MockDataService mockDataService) {
		return args -> {
		};
	}
}
