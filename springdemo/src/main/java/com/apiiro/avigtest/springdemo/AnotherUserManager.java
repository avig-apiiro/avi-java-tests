package com.apiiro.avigtest.springdemo;

public class AnotherUserManager {
    public static class AnotherUser {
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

    public AnotherUser getUser(String name) {
        return new AnotherUser(name.hashCode(), name, "user"+name, "1249", name+"@email.com");
    }
}
