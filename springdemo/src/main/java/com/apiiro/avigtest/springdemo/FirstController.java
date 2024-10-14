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



    @GetMapping("/first")
    public String first() {
        return "hello world";
    }
    @GetMapping("/path/{param}")
    public Map<String, String> pathparam(@PathVariable String param) {
        Map<String, String> response = new HashMap<>();
        response.put("param", param);
        return response;
    }

    @GetMapping(value = "/example" + Constants.PARAMNAME_BRACKETS)
    public Map<String, String> getExample(@PathVariable() String success) {
        Map<String, String> response = new HashMap<>();
        response.put(Constants.PARAMNAME, success);
        return response;
    }

    @GetMapping("/example2/{" + Constants.PARAMNAME + "}")
    public Map<String, String> getExample2(@PathVariable(Constants.PARAMNAME) String somevarname) {
        Map<String, String> response = new HashMap<>();
        response.put(Constants.PARAMNAME, somevarname);
        return response;
    }

    @GetMapping( Constants.PARAMNAME_P1  + Constants.PARAMNAME_P2)
    public Map<String, String> concatination(@PathVariable String p1, @PathVariable String p2) {
        Map<String, String> response = new HashMap<>();
        response.put("p1", p1);
        response.put("p2", p2);
        return response;
    }
}
