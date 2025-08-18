package com.apiiro.avigtest.springdemo;
import com.apiiro.avigtest.springdemo.utils.CloudinaryUploader;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.ApiParam;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import static com.apiiro.avigtest.springdemo.Constants.Internal.TWIST_AND_SHOUT;

@RestController
@RequestMapping(value = {"/beatels"})
public class BeatelsController {

    public static final class Routes {
        public static final String ABBEY_ROAD = "/abbey_road";
        @Deprecated(forRemoval = true, since = "123") public static final String HEY_JUDE = "/hey/jude/{recordId}";

    }

    public static final String NUMBER = "/number";
    public static final String NINE = "/9";
    public static final String NUMBER_NINE =NUMBER + NINE;

    public static final String PAUL = "/paul";
    private UserManager userManager = new UserManager();
    private AnotherUserManager anotherUserManager = new AnotherUserManager();

    @GetMapping(NUMBER_NINE)
    public String number9() {
        return "number9 number9 number9";
    }

    @RequestMapping(value = {Routes.ABBEY_ROAD}, method = RequestMethod.POST, produces = "application/json")
    public String abbeyRoad() {
        return "and in the end the love you take is equal to the love you make";
    }

    @PostMapping(TWIST_AND_SHOUT )
    public String twistAndShout() {
        return "Well, shake it up, baby";
    }


    @RequestMapping(value = Routes.HEY_JUDE, method = RequestMethod.POST, produces = "application/json")
    @Deprecated(forRemoval = true, since = "20240702")

    public ResponseEntity<String> heyJude(@ApiParam(value = "call record id", required = true)
        @PathVariable("recordId") String recordId,
                                     @RequestBody String transfer) {
        return  new ResponseEntity<String>("na na na na na nananananana", HttpStatusCode.valueOf(200));
    }

    @GetMapping("/yellow" + "/submarine")
    public String yellowSubmarine(@RequestParam("value") String value) throws IOException {
        var cu =  new CloudinaryUploader("cloudName", "api-key", "api-secret");
        String aws_url = "https:\\s3.us-east1.amazonaws.com\test3";
        cu.uploadImage(value);
        return "yellow submarine";
    }

    @GetMapping(Constants.PARAMNAME_P1 + "/john")
    public UserManager.User john(@PathVariable String p1) {
        return userManager.getUser("John");
    }

    @GetMapping(Constants.PARAMNAME_P1 + PAUL)
    public Map<String, String> paul(@PathVariable String p1) {
        userManager.getUser(PAUL);
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

    @GetMapping("/heyJude")
    public Map<String, String> heyJude(@PathVariable String p1) {
        userManager.getUser("Paul");
        Map<String, String> response = new HashMap<>();
        response.put("na", "na na nananananana");
        return response;
    }

    @GetMapping("/iamtheWarlus")
    public Map<String, String> iamthewarlus(@PathVariable String p1) {
        AnotherUserManager.AnotherUser u = anotherUserManager.getUser("Paul");
        Map<String, String> response = new HashMap<>();
        response.put("i", "am the eggman");
        return response;
    }

    @GetMapping( "/ringo" +  Constants.PARAMNAME_P1  + Constants.PARAMNAME_P2)
    public String ringo(@PathVariable String p1, @PathVariable String p2) {
        String aws_url = "https:\\s3.us-east1.amazonaws.com\test3";

        return String.format("Ringo star:  %s %s", p1 , p2);
    }
}