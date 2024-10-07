package com.apiiro.avigtest.tests;



import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(path = "tests")
public class SampleController {
    @RequestMapping(path = "startlesson.mvc", method = {RequestMethod.GET, RequestMethod.POST})
    public ModelAndView start() {
        var model = new ModelAndView();

        model.addObject("course", "c");
        model.addObject("lesson", "l");
        model.setViewName("lesson_content");

        return model;
    }
}
