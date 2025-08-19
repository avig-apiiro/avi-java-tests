package com.apiiro.avigtest.springdemo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AnotherUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // auto-increm
    int id;
    String name;
    String userName;
    String creditCardNumber;

    String email;

    public AnotherUser(int id, String name, String userName, String creditCardNumber, String email) {
        this.id = id;
        this.name = name;
        this.userName = userName;
        this.creditCardNumber = creditCardNumber;
        this.email = email;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUserName() {
        return userName;
    }

    public String getCreditCardNumber() {
        return creditCardNumber;
    }

    public String getEmail() {
        return email;
    }
}
