package com.apiiro.avigtest.springdemo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/foo")
public class FooController {


    public static final String PAUL = "/paul";

    @GetMapping(Constants.PARAMNAME_P1 + "/john")
    public Map<String, String> john(@PathVariable String p1) {
        Map<String, String> response = new HashMap<>();
        response.put("john p1", p1);
        return response;
    }

    @GetMapping(Constants.PARAMNAME_P1 + PAUL)
    public Map<String, String> paul(@PathVariable String p1) {
        Map<String, String> response = new HashMap<>();
        response.put("paul p1", p1);
        return response;
    }


}