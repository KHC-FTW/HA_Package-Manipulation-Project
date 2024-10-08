package org.packageManipulation;

import java.util.Map;

public class ConfigParameters {

    private static final ConfigParameters configParametersInstance = new ConfigParameters();
    private static String tempUnzipDirectory = null;
    private static int endingPackageCutOffValue;
    private static Map<String, String> hospDirectories = null;
    private static String reconfigWin = null;
    private static final String packagefolder = "\\Filedist\\package";
    private static final String CFGFolder = "\\Filedist\\CFG";
    private static final String iniFolder = "\\Netlogon\\scripts";

    private ConfigParameters(){}

    public void directoriesSetup(String tempUnzipDirectory_src,
                                 int endingPackageCutOffValue_src,
                                 Map<String, String> targetHospDir_src,
                                 String reconfigWin_src){
        tempUnzipDirectory = tempUnzipDirectory_src;
        endingPackageCutOffValue = endingPackageCutOffValue_src;
        hospDirectories = targetHospDir_src;
        reconfigWin = reconfigWin_src;
    }

    public static ConfigParameters getInstance() {
        return configParametersInstance;
    }

    public String getTempUnzipDirectory(){
        return tempUnzipDirectory;
    }

    public int getEndingPackageCutOffValue(){
        return endingPackageCutOffValue;
    }

    public Map<String, String> getHospPackageDirectories(){
        return hospDirectories;
    }

    public String getReconfigWin(){
        return reconfigWin;
    }

    public String getPackageFolderRelPath(){
        return packagefolder;
    }

    public String getCFGFolderRelPath(){
        return CFGFolder;
    }

    public String getIniFolderRelPath(){
        return iniFolder;
    }
}
