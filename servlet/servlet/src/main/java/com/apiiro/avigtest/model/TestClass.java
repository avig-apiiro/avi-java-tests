package com.apiiro.avigtest.model;

public class TestClass {

    private TestClass(Builder builder) {}

    public static class Builder{
        public TestClass build(){
            return new TestClass(new Builder());
        }
    }
}
