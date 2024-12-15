package com.apiiro.avigtest.springdemo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.apiiro.avigtest.ConstClass;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class OPController {
    @GetMapping(ConstClass.R1)
    public String funcget() {
        return "hello world";
    }

    @GetMapping(ConstClass.R2)
    public String funcget2() {
        return "hello world2";
    }


    @GetMapping(ConstClass.R3)
    public String funcget3(@PathVariable String p1) {
        return "hello world3"+p1;
    }

}
