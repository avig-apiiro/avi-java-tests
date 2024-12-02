package com.apiiro.avigtest.springdemo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/beatels")
public class BeatelsController {

    public static final String NUMBER = "/number";
    public static final String NINE = "/9";
    public static final String NUMBER_NINE =NUMBER + NINE;

    public static final String PAUL = "/paul";

    @GetMapping(NUMBER_NINE)
    public String number9() {
        return "number9 number9 number9";
    }
    @GetMapping("/yellow" + "/submarine")
    public String yellowSubmarine() {
        return "yellow submarine";
    }



    @GetMapping(Constants.PARAMNAME_P1 + "/john")
    public Map<String, String> john(@PathVariable String p1) {
        Map<String, String> response = new HashMap<>();
        response.put("John p1", p1);
        return response;
    }

    @GetMapping(Constants.PARAMNAME_P1 + PAUL)
    public Map<String, String> paul(@PathVariable String p1) {
        Map<String, String> response = new HashMap<>();
        response.put("Paul p1", p1);
        return response;
    }

    @GetMapping(value = "/george" + Constants.PARAMNAME_BRACKETS)
    public Map<String, String> george(@PathVariable() String success) {
        Map<String, String> response = new HashMap<>();
        response.put("George " + Constants.PARAMNAME, success);
        return response;
    }

    @GetMapping( "/ringo" +  Constants.PARAMNAME_P1  + Constants.PARAMNAME_P2)
    public String ringo(@PathVariable String p1, @PathVariable String p2) {
        return String.format("Ringo:  %s %s", p1 , p2);
    }
}