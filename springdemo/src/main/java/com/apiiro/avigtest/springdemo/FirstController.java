package com.apiiro.avigtest.springdemo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController("first")
@RequestMapping("/api")
public class FirstController {


    public static final String PARAMNAME = "param";

    @GetMapping("/first")
    public String first() {
        return "hello world";
    }
    @GetMapping("/path/{param}")
    public Map<String, String> pathparam(@PathVariable String param) {
        Map<String, String> response = new HashMap<>();
        response.put(PARAMNAME, param);
        return response;
    }

    @GetMapping("/example/{" + PARAMNAME + "}")
    public Map<String, String> getExample(@PathVariable String param) {
        Map<String, String> response = new HashMap<>();
        response.put(PARAMNAME, param);
        return response;
    }
}
