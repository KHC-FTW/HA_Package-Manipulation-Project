package org.packageManipulation;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path="/api", produces="application/json")
@CrossOrigin
public class RestAPIJsonResponse {

    public static void getPackDescIfExists(){

    }
}
