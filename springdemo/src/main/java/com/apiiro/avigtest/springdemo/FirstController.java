package com.apiiro.avigtest.springdemo;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController("first")
@RequestMapping("/api")
public class FirstController {

    public static final String API = "/e";
    public static final String API_V1 = API + "/vv1";
    public static final String PARTNERS = "/p";
    public static final String PARTNER_ID = "/{partnerId}";
    public static final String PARTNER = PARTNERS + PARTNER_ID;
    public static final String BENEFITS = "/c";

    public static final String TST = API_V1 + PARTNER + BENEFITS;

    @GetMapping("/first")
    public String first() {
        return "hello world";
    }
    @GetMapping({"/second", "/third", "/fourth"})
    public String arraycheck() {
        return "hello world";
    }
    @GetMapping(value = {"/2", "/3", "/4"})
    public String arraycheck2() {
        return "array check7 ";
    }
    @GetMapping("{id}")
    public String funcget() {
        return "hello world with an id";
    }

    @PostMapping(path = "")
    @ResponseBody
    public String empty() {
        return "hello world empty";
    }

    @PostMapping(path = Constants.TST)
    @ResponseBody
    public String constpath() {
        return "hello world";
    }


    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Error methodArgumentNotValidException(final HttpServletRequest request,
                                                           final MethodArgumentNotValidException exception) {
        return new ClassCircularityError("methodArgumentNotValidException");
    }
}
