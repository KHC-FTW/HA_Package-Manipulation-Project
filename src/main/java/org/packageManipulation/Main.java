package org.packageManipulation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;

@SpringBootApplication
public class Main {
    public static void main(String[] args) throws IOException {

        final String configFailMsg = "Due to error reading the config file, the server will not initialize.\nPlease modify the config file to ensure the directory/ file paths are valid and try again.\n";

        try{
            if (Helper.configParsingAndInitialization(args)){
                SpringApplication.run(Main.class, args);
            }else{
                System.out.println(configFailMsg);
            }
        }catch(IOException e){
            System.out.println(configFailMsg);
        }

    }
}