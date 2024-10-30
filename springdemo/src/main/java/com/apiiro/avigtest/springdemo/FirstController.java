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
        return "hello world";
    }
    @GetMapping("{id}")
    public String funcget() {
        return "hello world with id";
    }

    @PostMapping(path = "")
    public String empty() {
        return "hello world empty";
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Error methodArgumentNotValidException(final HttpServletRequest request,
                                                           final MethodArgumentNotValidException exception) {
        return new ClassCircularityError("methodArgumentNotValidException");
    }
}
