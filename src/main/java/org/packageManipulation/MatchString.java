package org.packageManipulation;

import java.util.regex.Pattern;

public class MatchString {
    private MatchString(){}
    private static final Pattern letterAndNum = Pattern.compile("[a-zA-Z0-9]*");

    public static boolean isLetterAndNumOnly(String toCheck){
        return letterAndNum.matcher(toCheck).matches();
    }
}
