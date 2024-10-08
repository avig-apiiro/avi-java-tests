package com.apiiro.avigtest.prod;

import org.springframework.context.annotation.Description;
import org.springframework.context.annotation.EnableLoadTimeWeaving;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.stream.Collectors;
import javax.validation.Valid;
import javax.validation.constraints.Size;

@EnableLoadTimeWeaving
@Deprecated
@Description("my lovely controller")
@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping(path = {
        "/api/v1/foo/app"
})
@Validated
public class FooController {


    @Validated(FooController.class)
    @PostMapping(value = "/address", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> addressVerification(@Valid @RequestBody @Size(max = 5) Collection<SampleDTO> model) {
        return new ResponseEntity<>(model.stream().map(m -> Integer.toString(m.val)).collect(Collectors.joining(",")), HttpStatus.OK);

    }
}