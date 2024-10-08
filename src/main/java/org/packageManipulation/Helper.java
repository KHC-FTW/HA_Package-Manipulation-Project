package org.packageManipulation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.compress.archivers.ArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.ini4j.Profile;
import org.ini4j.Wini;
import org.packageManipulation.Components.HospWorkstation;
import org.springframework.boot.autoconfigure.ssl.SslProperties;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;


public class Helper {

    public static boolean configParsingAndInitialization(String[] args) throws IOException{

        final String configFileName = "PackageManipulationConfig.ini";
        String configFileDirectory = null;
        File srcConfigFile = null;
        Boolean srcConfigRequired = false;

        if (args.length == 1){
            configFileDirectory = args[0];
            srcConfigFile = new File(configFileDirectory + "\\" + configFileName);
            if (!srcConfigFile.exists()){
                srcConfigRequired = true;
            }
        }else{
            srcConfigRequired = true;
        }

        if(srcConfigRequired){
            Scanner getInput = null;
            try{
                System.out.println("\nNo valid config file directory identified from command line.");
                System.out.print("Please enter the source config file directory:\n> ");
                getInput = new Scanner(System.in);
                configFileDirectory = getInput.nextLine();
                srcConfigFile = new File(configFileDirectory + "\\" + configFileName);

                while(!srcConfigFile.exists()){
                    System.out.println("Invalid source config directory. Please enter again (Make sure the config file is named as \"PackageManipulationConfig.ini\":");
                    configFileDirectory = getInput.nextLine();
                    srcConfigFile = new File(configFileDirectory + "\\" + configFileName);
                }
            }finally {
                if (getInput != null) getInput.close();
            }
        }

        Wini configFile = new Wini(srcConfigFile);

        if(!configFileDebugger(configFile)){

            ConfigParameters configParameters = ConfigParameters.getInstance();
            configParameters.directoriesSetup(
                    configFile.get("HostMachineParam").get("TempUnzipPath"),
                    Integer.parseInt(configFile.get("TaskIniParam").get("EndingPackageCutOffValue")),
                    configFile.get("TargetHospDirectory"),
                    configFile.get("reconfig_window_ver").get("WinVersion"));
            System.out.println("\nHost and target machines' directory parameters have been set up successfully.\n");
            return true;
        }
        return false;
    }
    private static boolean configFileDebugger(Wini configFileToTest){

        final String RED_BOLD = "\033[1;31m";
        final String RESET = "\033[0m";

        final String packagefolder = "\\Filedist\\package";
        final String CFGFolder = "\\Filedist\\CFG";
        final String iniFolder = "\\Netlogon\\scripts";
        boolean hasInvalidItem = false;

        String tempUnZipFolderPath = configFileToTest.get("HostMachineParam").get("TempUnzipPath");

        File tempUnZipFolder = new File(tempUnZipFolderPath);

        System.out.println();
        if(!tempUnZipFolder.exists()){
            hasInvalidItem = true;
            System.out.println(RED_BOLD);
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("TempUnzipPath:\n" + tempUnZipFolder + "\nis invalid or does not exist.");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println(RESET);
        }else{
            System.out.println("Checked TempUnzipPath OK!");
        }

        try{
            int cutOffVal = Integer.parseInt(configFileToTest.get("TaskIniParam").get("EndingPackageCutOffValue"));
            if(cutOffVal <= 0){
                hasInvalidItem = true;
                System.out.println(RED_BOLD);
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("TaskIniParam:\n EndingPackageCutOffValue is invalid.");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println(RESET);
            }else{
                System.out.println("Checked TaskIniParam OK!");
            }
        }catch(NullPointerException | NumberFormatException e){
            hasInvalidItem = true;
            System.out.println(RED_BOLD);
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("TaskIniParam:\n EndingPackageCutOffValue is invalid.");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.out.println(RESET);
        }

        Map<String, String> hospDir = configFileToTest.get("TargetHospDirectory");
        List<String> allHospDirKeys = new ArrayList<>(hospDir.keySet());

        String reconfigWin = configFileToTest.get("reconfig_window_ver").get("WinVersion");
        for (String hosp: allHospDirKeys){
            String hospDirPath = configFileToTest.get("TargetHospDirectory").get(hosp);
            File hospPackDirFolder = new File(hospDirPath + packagefolder);
            File hospCFGFolder = new File(hospDirPath + CFGFolder);
            File hospIniFolder = new File(hospDirPath + iniFolder);
            File hospReconfigWinAutorun = new File(hospDirPath + "\\Filedist\\package\\" + reconfigWin + "\\autorun.bat");
            if (!hospPackDirFolder.exists() || !hospCFGFolder.exists() || !hospIniFolder.exists()){
                hasInvalidItem = true;
                System.out.println(RED_BOLD);
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println(hosp + ":\n" + hospDirPath + "\nis invalid or has invalid subdirectories.");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println(RESET);
            }else{
                System.out.println("Checked " + hosp + " OK!");
            }
            if (!hospReconfigWinAutorun.exists()){
                System.out.println(RED_BOLD);
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println("WARNING: " + hosp + " does not have reconfigWin package.");
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                System.out.println(RESET);
            }
        }

        return hasInvalidItem;
    }

    public static void startOperation(PackageMetadata packageMetadata, ConfigParameters configParameters){

        // one-off action:
        // 1) unzip package to temp folder
        // 2) clear temp folder (after all loop actions performed successfully)

        // 4 types of loop action:
        // 1) backup tasklist.ini, backup package.ini
        // 2) update tasklist.ini
        // 3) update package.ini
        // 4) copy pack from temp to target dir

        SimpMessagingTemplate messagingTemplate = packageMetadata.getMessagingTemplate();
        String notifyClientPath = packageMetadata.getNotifyClientPath();
        Map<String, File> tempUnzipLocation = null;
        try{
            tempUnzipLocation = unzipPackageToTempFolder(packageMetadata, configParameters);
            for (String hospCode: packageMetadata.getFinalHospDest()){
                try{
                    backupIniFile(hospCode, configParameters);
                    updateTasklistIni(hospCode, packageMetadata, configParameters);
                    updatePackageIni(hospCode, packageMetadata, configParameters);
                    copyPackageToDest(hospCode, tempUnzipLocation.get("srcPackageContent"), packageMetadata, configParameters);
                    BatFileService.updateReconfig_w(hospCode, packageMetadata, configParameters);
                    messagingTemplate.convertAndSend(notifyClientPath, hospCode + ": All operations completed successfully!");
                }catch (IOException e){
                    messagingTemplate.convertAndSend(notifyClientPath, e + "\n!!! " + hospCode + " !!!");
                }
            }
        }catch(IOException e){
            messagingTemplate.convertAndSend(notifyClientPath, e.getMessage());
        }finally {
            try{
                FileUtils.deleteDirectory(tempUnzipLocation.get("tempUnzipDir"));
                messagingTemplate.convertAndSend(notifyClientPath, "All backend operations have finished running.");
            }catch (IOException e){
                messagingTemplate.convertAndSend(notifyClientPath, "WARNING: Failed to delete temp unzip folder at:\n" + tempUnzipLocation.get("tempUnzipDir").getAbsolutePath());
                messagingTemplate.convertAndSend(notifyClientPath, "All backend operations have finished running.");
            }
        }
    }

    private static Map<String, File> unzipPackageToTempFolder(PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException{

        try{
            Map<String, File> results = new HashMap<>(2);

            String packageNameZip = packageMetadata.getPackageFile().getOriginalFilename();

            // transfer received zip file to a temp folder first
            String tempUnzipDirPath = configParameters.getTempUnzipDirectory() + "\\temp_folder\\temp_unzip";
            File tempUnzipDir = new File(tempUnzipDirPath);
            int dupCnt = 1;
            if (!tempUnzipDir.exists()) tempUnzipDir.mkdirs();
            else{
                do{
                    tempUnzipDir = new File(tempUnzipDirPath + " (" + dupCnt++ + ")");
                }while(tempUnzipDir.exists());
                tempUnzipDir.mkdirs();
            }
            results.put("tempUnzipDir", tempUnzipDir);

            File tempZip = new File(tempUnzipDir + "\\" + packageNameZip);
            packageMetadata.getPackageFile().transferTo(tempZip);

            // Create temp folder to hold zip unpacked content
            File unzipToTempFolder = new File(tempUnzipDir + "\\" + packageMetadata.getPackageName());
            if (!unzipToTempFolder.exists()){
                unzipToTempFolder.mkdirs();
            }

            int zipFileSize = (int)packageMetadata.getPackageFile().getSize();
            byte[] buffer = new byte[zipFileSize];
            // !!!IMPORTANT: Encoding with Big5_HKSCS to make sure Chinese characters can be recognized
            ZipArchiveInputStream zis = new ZipArchiveInputStream(new FileInputStream(tempZip), "Big5_HKSCS");
            ArchiveEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                File newFile = newFile(unzipToTempFolder, zipEntry);
                if (zipEntry.isDirectory()) {
                    if (!newFile.isDirectory() && !newFile.mkdirs()) {
                        // throw new IOException("Failed to create directory: " + newFile);
                        throw new IOException("CRITICAL: Failed to unzip package. Operation aborted.");
                    }
                } else {
                    // fix for Windows-created archives
                    File parent = newFile.getParentFile();
                    if (!parent.isDirectory() && !parent.mkdirs()) {
                        // throw new IOException("Failed to create directory: " + parent);
                        throw new IOException("CRITICAL: Failed to unzip package. Operation aborted.");
                    }
                    // write file content
                    FileOutputStream fos = new FileOutputStream(newFile);
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                    fos.close();
                }
                zipEntry = zis.getNextEntry();
            }
            zis.close();
            //delete temp zip file uploaded to server
            tempZip.delete();

            File srcPackageContent = new File(tempUnzipDir + "\\" + packageMetadata.getPackageName() + "\\" + packageMetadata.getPackageName());
            if(!srcPackageContent.exists()){
                srcPackageContent = unzipToTempFolder;
            }
            results.put("srcPackageContent", srcPackageContent);

            // e.g. C:\Users\CKH637\Desktop\CKH637_DocsAndStorage\_Project\PackageManipulation\temp_folder\temp_unzip\eotlink(TEST)\eotlink(TEST)
            if (!BatFileService.addRemToPackageAutorun(srcPackageContent.getAbsolutePath())){
                packageMetadata.getMessagingTemplate().convertAndSend(packageMetadata.getNotifyClientPath(), "WARNING: No autorun.bat file in \"" + packageMetadata.getPackageName() + "\"");
            }

            return results;
        }catch(IOException e){
            throw new IOException("CRITICAL: Error encountered during package unzip or adding rem to autorun.bat. Operation aborted. Please retry later.");
        }

    }
    private static File newFile(File destinationDir, ArchiveEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());
        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();
        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw new IOException("CRITICAL: Failed to unzip package. Operation aborted.");
        }
        return destFile;
    }

    private static void backupIniFile(String hospCode, ConfigParameters configParameters) throws IOException{
        String iniDirectory = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath();
        List<String> filesToCopy = new ArrayList<>(Arrays.asList("tasklist.ini", "package.ini"));
        String iniBackupPath = iniDirectory + "\\_AutoBackup";
        File backupFolder = new File(iniBackupPath);
        if (!backupFolder.exists()) backupFolder.mkdirs();
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyyMMdd").format(date);
        for (String iniFile: filesToCopy){
            try{
                int duplicateCnt = 1;
                Path srcPath = Paths.get(iniDirectory + "\\" + iniFile);
                byte [] buffer = Files.readAllBytes(srcPath);
                File srcFile = new File(iniDirectory + "\\" + iniFile);
                String iniFileToBackupPath = iniBackupPath + "\\" + iniFile + "." + formattedDate;
                File destFile = new File(iniFileToBackupPath);
                while(destFile.exists()){
                    String newIniFileToBackupPath = iniFileToBackupPath + " (" + duplicateCnt++ + ")";
                    destFile = new File(newIniFileToBackupPath);
                }
                InputStream srcFileIS = null;
                OutputStream destFileOS = null;
                try {
                    srcFileIS = new FileInputStream(srcFile);
                    destFileOS = new FileOutputStream(destFile);
                    int length;
                    while ((length = srcFileIS.read(buffer)) > 0) {
                        destFileOS.write(buffer, 0, length);
                    }
                } finally {
                    srcFileIS.close();
                    destFileOS.close();
                }
            }catch(IOException e){
                throw new IOException("CRITICAL: Failed to backup " + iniFile);
            }
        }
    }

    private static void updateTasklistIni(String hospCode, PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException{
        SimpMessagingTemplate messagingTemplate = packageMetadata.getMessagingTemplate();
        String notifyClientPath = packageMetadata.getNotifyClientPath();
        String packDescAction = packageMetadata.getPackDescAction();
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(date);
        int endingPackCutOffVal = configParameters.getEndingPackageCutOffValue();
        String packagePath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + packageMetadata.getPackageName();
        File packageToCheck = new File(packagePath);
        String tasklistIni = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath() + "\\tasklist.ini";

        try{
            Wini iniToUpdate = new Wini(new File(tasklistIni));
            //adhere to source format
            iniToUpdate.getConfig().setStrictOperator(true);
            String newPackageDesc = packageMetadata.getPackDesc() + "   (" + formattedDate + ", " + packageMetadata.getPackUpdateStaff() + ")";

            if (!packageToCheck.exists()) {
                // required number for the new package
                List<String> allPackageCodes = new ArrayList<>(iniToUpdate.get("Tasks").keySet());
                Map<String, Integer> packageResults = getEndingPackAndGenNewPackNum(allPackageCodes, endingPackCutOffVal);
                int remainingSlotErrorCode = packageResults.get("remainingSlotErrorCode");

                if (remainingSlotErrorCode <= 1) {
                    // list of all existing packages in the ini file
//                        Map<String, String> taskKeyValuePairs = iniToUpdate.get("Tasks");
                    Map<String, String> tempEndingKeyValuePairs = new LinkedHashMap<>();
                    Map<String, Profile.Section> tempEndPackCodeAndDesc = new LinkedHashMap<>();

                    int iteration = packageResults.get("numOfEndingPackages");
                    int idx = allPackageCodes.size() - iteration;

                    for (int iter = iteration, i = idx; iter > 0; iter--, i++) {
                        String currTaskPackKey = allPackageCodes.get(i);
                        String currTaskPackValue = iniToUpdate.get("Tasks").get(currTaskPackKey);
                        tempEndingKeyValuePairs.put(currTaskPackKey, currTaskPackValue);
                        // System.out.println("tempEndingKeyValuePairs: " + tempEndingKeyValuePairs);

                        Profile.Section currEndPackSec = iniToUpdate.get(currTaskPackKey);
                        tempEndPackCodeAndDesc.put(currTaskPackKey, currEndPackSec);

                        iniToUpdate.get("Tasks").remove(currTaskPackKey);
                        iniToUpdate.remove(currTaskPackKey);
                    }

                    String newPackageCode = getNewPackageCode(packageResults.get("newPackageNum"));

                    // insert new stuff:
                    iniToUpdate.put("Tasks", newPackageCode, newPackageDesc);
                    iniToUpdate.put(newPackageCode, "Load", "Once");
                    iniToUpdate.put(newPackageCode, "Packages", packageMetadata.getPackageName());
                    iniToUpdate.put(newPackageCode, "WorkStations", packageMetadata.getWorkStations().get(hospCode));
                    iniToUpdate.put(newPackageCode, "MachineGroups", packageMetadata.getMachineGroups().get(hospCode));

                    iniToUpdate.get("Tasks").putAll(tempEndingKeyValuePairs);
                    iniToUpdate.putAll(tempEndPackCodeAndDesc);
                    iniToUpdate.store();
                    if (remainingSlotErrorCode == 1){
                        messagingTemplate.convertAndSend(notifyClientPath, "WARNING: Only less than 10 remaining slots in tasklist.ini to insert new packages for " + hospCode + ".\nPlease inform developer if possible.");
                    }
//                messagingTemplate.convertAndSend(notifyClientPath, "Updated tasklist.ini of " + hospCode + " at:\n" + tasklistIni);
                }else {
                    throw new IOException("CRITICAL: NO free slot in tasklist.ini.\nPlease inform developer ASAP!");
                }
            } else{
                List<String> allKeys = new ArrayList<>(iniToUpdate.keySet());
                String targetKey = null;
                for (String key: allKeys){
                    if(!key.equals("Tasks") && !key.equals("?")){
                        String currPackName = iniToUpdate.get(key).get("Packages");
                        if (currPackName.equals(packageMetadata.getPackageName())){
                            targetKey = key;
                            iniToUpdate.get(key).put("WorkStations", packageMetadata.getWorkStations().get(hospCode));
                            iniToUpdate.get(key).put("MachineGroups", packageMetadata.getMachineGroups().get(hospCode));
                            iniToUpdate.store();
                            break;
                        }
                    }
                }
                switch(packDescAction){
                    case "overwrite":{
                        iniToUpdate.put("Tasks", targetKey, newPackageDesc);
                        iniToUpdate.store();
                        break;
                    }
                    case "append":{
                        String originalDesc = iniToUpdate.get("Tasks").get(targetKey);
                        iniToUpdate.put("Tasks", targetKey, originalDesc + "; " + newPackageDesc);
                        iniToUpdate.store();
                        break;
                    }
                    default:
                        break;
                }
            }
        }catch(IOException | NumberFormatException e){
            throw new IOException("CRITICAL: Failed to update tasklist.ini.\n" + e);
        }
    }
    private static Map<String, Integer> getEndingPackAndGenNewPackNum(List<String> allPackages, int endingPackCutOffVal){

        // iterate backwards and compare with previous package number
        // difference should be 1 only
        // any difference greater than 1 -> target
        // add 1 to generate the target package number
        Map<String, Integer> results = new HashMap<>(3);
        int lastIdx = allPackages.size() - 1;
        int numOfEndingPackages = 0;
        int newPackageNum = -1;
        int remaingSlot = 0;

        while(true){
            int current = getPackageNumber(allPackages.get(lastIdx--));
            if (current > endingPackCutOffVal){
                numOfEndingPackages++;
            }else{
                newPackageNum = current + 1;
                remaingSlot = endingPackCutOffVal - newPackageNum;

                // remaining slot error code description:
                // 0: still has enough slots
                // 1: only less than 10 slots left, time to edit the endingPackCutOffVal
                // 2: completely out of available slot, subsequent action should be aborted
                if (remaingSlot > 10) remaingSlot = 0;
                else if (remaingSlot == 0) remaingSlot = 2;
                else remaingSlot = 1;
                break;
            }
        }

        results.put("numOfEndingPackages", numOfEndingPackages);
        results.put("newPackageNum", newPackageNum);
        results.put("remainingSlotErrorCode", remaingSlot);
        return results;
    }
    private static int getPackageNumber(String key){
        int convertedValue = -1; // if return -1, indicates error of invalid number format
        String num = key.substring(1);
        convertedValue = Integer.parseInt(num);
        return convertedValue;
    }
    private static String getNewPackageCode(int packageNum){

        StringBuilder packageName = new StringBuilder("T");
        String packageValue = Integer.toString(packageNum);
        final int limit = 5;    // max 5 digits
        for (int i = packageValue.length(); i < limit; i++){
            packageName.append("0");
        }
        packageName.append(packageValue);
        return packageName.toString();

    }

    private static void updatePackageIni(String hospCode, PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException {
        try{
            String packagePath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + packageMetadata.getPackageName();
            File packageToCheck = new File(packagePath);
            if(!packageToCheck.exists()) {
                String packageIni = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath() + "\\package.ini";
                Wini iniToUpdate = new Wini(new File(packageIni));
                iniToUpdate.getConfig().setStrictOperator(true);

                String sourceDir = "\\\\%DISTRIBUTION_S%\\FILEDIST\\PACKAGE\\";
                String newPackageName = packageMetadata.getPackageName();
                sourceDir += newPackageName;
                sourceDir += "\\autorun.bat";

                iniToUpdate.put(newPackageName, "Status", "Active");
                iniToUpdate.put(newPackageName, "OS", "WINNT");
                iniToUpdate.put(newPackageName, "SourceDir", sourceDir);
                iniToUpdate.store();
            }
        }catch (IOException e){
            throw new IOException("CRITICAL: Failed to update package.ini.\n" + e);
        }
    }

    private static void copyPackageToDest(String hospCode, File srcPackDir, PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException {
        try {
            final String newPackName = packageMetadata.getPackageName();
            String destPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + newPackName;
            File dest = new File(destPath);
            if(dest.exists()){
                String packBackupPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\_AutoBackup\\" + newPackName;
                relocatePackToBackup(dest, packBackupPath);
            }
            copyDirectory(srcPackDir, dest);
        }catch(IOException e){
            throw new IOException("CRITICAL: Failed to copy package.");
        }
    }
    private static void relocatePackToBackup(File existingDir, String packBackupPath) throws IOException {
        File[] existingFiles = existingDir.listFiles();
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyyMMdd").format(date);
        int duplicateCnt = 1;
        String datedPackBackupPath = packBackupPath + "." + formattedDate;

        File backupFolder = new File(datedPackBackupPath);
        if(!backupFolder.exists()){
            backupFolder.mkdirs();
        }else{
            String newBackupFolderPath = datedPackBackupPath + " (" + duplicateCnt + ")";
            backupFolder = new File(newBackupFolderPath);
            while(backupFolder.exists()){
                duplicateCnt++;
                newBackupFolderPath = datedPackBackupPath + " (" + duplicateCnt + ")";
                backupFolder = new File(newBackupFolderPath);
            }
            backupFolder.mkdirs();
        }
        if (existingFiles != null){
            for (File file: existingFiles){
                File targetFile = new File(backupFolder, file.getName());
                if (file.isDirectory()) {
                    copyDirectory(file, targetFile);
                    FileUtils.deleteDirectory(file);
                } else {
                    Files.copy(file.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    file.delete();
                }
            }
        }
    }
    private static void copyDirectory(File sourceDir, File targetDir) throws IOException {
        if (!targetDir.exists()) {
            targetDir.mkdirs();
        }
        File[] files = sourceDir.listFiles();
        if (files != null) {
            for (File file : files) {
                File targetFile = new File(targetDir, file.getName());
                if (file.isDirectory()) {
                    copyDirectory(file, targetFile);
                } else {
                    Files.copy(file.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
    }

    public static Map<String, String> customJSONObjToJavaMap(String jsonString) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        ArrayList<Map<String, Object>> jsonMap = objectMapper.readValue(jsonString,
                new TypeReference<ArrayList<Map<String, Object>>>(){});

        Map<String, String> result = new LinkedHashMap<>();
        for (Map item: jsonMap){
            List<String> hospCodeArr = new ArrayList<>(item.keySet());
            String hospCode = hospCodeArr.get(0);
            Object objValue = item.get(hospCode);
            String stringifiedObjValue = objValue.toString();
            String modifiedValue = stringifiedObjValue.substring(1, stringifiedObjValue.length() - 1).replaceAll(" ","");
            result.put(hospCode, modifiedValue);
        }
        return result;
    }

    /*@Deprecated
    public static void hospCopyIniFileAndRename(PackageMetadata packageMetadata, ConfigParameters configParameters)  {
        SimpMessagingTemplate messagingTemplate = packageMetadata.getMessagingTemplate();
        String notifyClientPath = packageMetadata.getNotifyClientPath();
        List<String> successCases = new ArrayList<>();
        List<String> failCases = new ArrayList<>();
        for (String hospCode: packageMetadata.getFinalHospDest()){
            try{
                String iniDirectory = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath();
                copyIniFileAndRename(iniDirectory);
                successCases.add(hospCode);
            }catch(IOException e){
                failCases.add(hospCode);
            }
            //messagingTemplate.convertAndSend(notifyClientPath, hospCode + " ini files backed up to:\n" + iniDirectory + "\\backup");
        }

        if(!successCases.isEmpty()){
            String successMsg = "SUCCESSFULLY backed up ini files for:\n" + successCases.toString().substring(1, successCases.size() - 1);
            messagingTemplate.convertAndSend(notifyClientPath, successMsg);
        }

        if(!failCases.isEmpty()){
            String failMsg = "FAILED to backup ini files to:\n" + failCases.toString().substring(1, failCases.size() - 1);
            messagingTemplate.convertAndSend(notifyClientPath, failMsg);
        }

    }*/
    /*@Deprecated
    private static void copyIniFileAndRename(String iniDirectory) throws IOException {
        List<String> filesToCopy = new ArrayList<>(Arrays.asList("tasklist.ini", "package.ini"));

        String iniBackupPath = iniDirectory + "\\_AutoBackup";
        File backupFolder = new File(iniBackupPath);
        if (!backupFolder.exists()) backupFolder.mkdirs();
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyyMMdd").format(date);
        for (String iniFile: filesToCopy){
            try{
                int duplicateCnt = 1;
                Path srcPath = Paths.get(iniDirectory + "\\" + iniFile);
                byte [] buffer = Files.readAllBytes(srcPath);
                File srcFile = new File(iniDirectory + "\\" + iniFile);
                String iniFileToBackupPath = iniBackupPath + "\\" + iniFile + "." + formattedDate;
                File destFile = new File(iniFileToBackupPath);
                while(destFile.exists()){
                    String newIniFileToBackupPath = iniFileToBackupPath + " (" + duplicateCnt + ")";
                    System.out.println(newIniFileToBackupPath);
                    destFile = new File(newIniFileToBackupPath);
                    duplicateCnt++;
                }
                InputStream srcFileIS = null;
                OutputStream destFileOS = null;
                try {
                    srcFileIS = new FileInputStream(srcFile);
                    destFileOS = new FileOutputStream(destFile);
                    int length;
                    while ((length = srcFileIS.read(buffer)) > 0) {
                        destFileOS.write(buffer, 0, length);
                    }
                } finally {
                    srcFileIS.close();
                    destFileOS.close();
                }
            }catch(IOException e){
                throw new IOException("Failed to backup " + iniFile);
            }
        }
    }*/
    /*@Deprecated
    public static void updateTasklistIni(PackageMetadata packageMetadata, ConfigParameters configParameters) {
        SimpMessagingTemplate messagingTemplate = packageMetadata.getMessagingTemplate();
        String notifyClientPath = packageMetadata.getNotifyClientPath();
        String packDescAction = packageMetadata.getPackDescAction();
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(date);
        int endingPackCutOffVal = configParameters.getEndingPackageCutOffValue();

        List<String> successCases = new ArrayList<>();
        List<String> failCases = new ArrayList<>();

        for (String hospCode: packageMetadata.getFinalHospDest()){
            try{
                String packagePath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + packageMetadata.getPackageName();
                File packageToCheck = new File(packagePath);
                String tasklistIni = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath() + "\\tasklist.ini";

                Wini iniToUpdate = new Wini(new File(tasklistIni));
                //adhere to source format
                iniToUpdate.getConfig().setStrictOperator(true);

                String newPackageDesc = packageMetadata.getPackDesc() + "   (" + formattedDate + ", " + packageMetadata.getPackUpdateStaff() + ")";

                if (!packageToCheck.exists()) {
                    // required number for the new package
                    List<String> allPackageCodes = new ArrayList<>(iniToUpdate.get("Tasks").keySet());
                    Map<String, Integer> packageResults = getEndingPackAndGenNewPackNum(allPackageCodes, endingPackCutOffVal);
                    int remaingSlotErrorCode = packageResults.get("remaingSlotErrorCode");

                    if (remaingSlotErrorCode >= 1) {
                        // list of all existing packages in the ini file
//                        Map<String, String> taskKeyValuePairs = iniToUpdate.get("Tasks");
                        Map<String, String> tempEndingKeyValuePairs = new LinkedHashMap<>();
                        Map<String, Profile.Section> tempEndPackCodeAndDesc = new LinkedHashMap<>();

                        int iteration = packageResults.get("numOfEndingPackages");
                        int idx = allPackageCodes.size() - iteration;

                        for (int iter = iteration, i = idx; iter > 0; iter--, i++) {
                            String currTaskPackKey = allPackageCodes.get(i);
                            String currTaskPackValue = iniToUpdate.get("Tasks").get(currTaskPackKey);
                            tempEndingKeyValuePairs.put(currTaskPackKey, currTaskPackValue);
                            // System.out.println("tempEndingKeyValuePairs: " + tempEndingKeyValuePairs);

                            Profile.Section currEndPackSec = iniToUpdate.get(currTaskPackKey);
                            tempEndPackCodeAndDesc.put(currTaskPackKey, currEndPackSec);

                            iniToUpdate.get("Tasks").remove(currTaskPackKey);
                            iniToUpdate.remove(currTaskPackKey);
                        }

                        String newPackageCode = getNewPackageCode(packageResults.get("newPackageNum"));

                        // insert new stuff:
                        iniToUpdate.put("Tasks", newPackageCode, newPackageDesc);
                        iniToUpdate.put(newPackageCode, "Load", "Once");
                        iniToUpdate.put(newPackageCode, "Packages", packageMetadata.getPackageName());
                        iniToUpdate.put(newPackageCode, "WorkStations", packageMetadata.getWorkStations().get(hospCode));
                        iniToUpdate.put(newPackageCode, "MachineGroups", packageMetadata.getMachineGroups().get(hospCode));

                        iniToUpdate.get("Tasks").putAll(tempEndingKeyValuePairs);
                        iniToUpdate.putAll(tempEndPackCodeAndDesc);
                        iniToUpdate.store();
                        if (remaingSlotErrorCode <= 10){
                            messagingTemplate.convertAndSend(notifyClientPath, "WARNING: Only less than 10 remaining slots in tasklist.ini to insert new packages for " + hospCode + ".\nPlease inform developer if possible.");
                        }
//                messagingTemplate.convertAndSend(notifyClientPath, "Updated tasklist.ini of " + hospCode + " at:\n" + tasklistIni);
                    }else {
                        failCases.add(hospCode);
                        messagingTemplate.convertAndSend(notifyClientPath, "CRITICAL: NO free slot in tasklist.ini to insert new package for " + hospCode + ".\nPlease inform developer ASAP!");
                        continue;
                    }
                } else{
                    switch(packDescAction){
                            case "overwrite":{
                                List<String> allKeys = new ArrayList<>(iniToUpdate.keySet());
                                for (String key: allKeys){
                                    if(!key.equals("Tasks") && !key.equals("?")){
                                        String currPackName = iniToUpdate.get(key).get("Packages");
                                        if (currPackName.equals(packageMetadata.getPackageName())){
                                            iniToUpdate.put("Tasks", key, newPackageDesc);
                                            break;
                                        }
                                    }
                                }
                                iniToUpdate.store();
                                break;
                            }
                            case "append":{
                                List<String> allKeys = new ArrayList<>(iniToUpdate.keySet());
                                for (String key: allKeys){
                                    if(!key.equals("Tasks") && !key.equals("?")){
                                        String currPackName = iniToUpdate.get(key).get("Packages");
                                        if (currPackName.equals(packageMetadata.getPackageName())){
                                            String originalDesc = iniToUpdate.get("Tasks").get(key);
                                            iniToUpdate.put("Tasks", key, originalDesc + "; " + newPackageDesc);
                                            break;
                                        }
                                    }
                                }
                                iniToUpdate.store();
                                break;
                            }
                            default:
                                break;
                        }
                }
                successCases.add(hospCode);
            }catch(IOException | NumberFormatException e){
                failCases.add(hospCode);
            }
        }
        if (!successCases.isEmpty()) {
            String successMsg = "SUCCESSFULLY update tasklist.ini files for:\n" + successCases.toString().substring(1, successCases.size() - 1);
            messagingTemplate.convertAndSend(notifyClientPath, successMsg);
        }
        if(!failCases.isEmpty()){
            String failMsg = "FAILED to update tasklist.ini files for:\n" + failCases.toString().substring(1, failCases.size() - 1);
            messagingTemplate.convertAndSend(notifyClientPath, failMsg);
        }
    }*/
    /*@Deprecated
    public static void updatePackageIni(PackageMetadata packageMetadata, ConfigParameters configParameters) {

        SimpMessagingTemplate messagingTemplate = packageMetadata.getMessagingTemplate();
        String notifyClientPath = packageMetadata.getNotifyClientPath();
        for (String hospCode: packageMetadata.getFinalHospDest()){

            try{
                String packagePath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + packageMetadata.getPackageName();
                File packageToCheck = new File(packagePath);

                if(!packageToCheck.exists()) {
                    String packageIni = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getIniFolderRelPath() + "\\package.ini";
                    Wini iniToUpdate = new Wini(new File(packageIni));
                    iniToUpdate.getConfig().setStrictOperator(true);

                    String sourceDir = "\\\\%DISTRIBUTION_S%\\FILEDIST\\PACKAGE\\";
                    String newPackageName = packageMetadata.getPackageName();
                    sourceDir += newPackageName;
                    sourceDir += "\\autorun.bat";

                    iniToUpdate.put(newPackageName, "Status", "Active");
                    iniToUpdate.put(newPackageName, "OS", "WINNT");
                    iniToUpdate.put(newPackageName, "SourceDir", sourceDir);
                    iniToUpdate.store();
                }
//                messagingTemplate.convertAndSend(notifyClientPath, "Updated package.ini of " + hospCode + " at:\n" + packageIni);
            }catch (IOException e){


            }

        }

    }*/
    /*@Deprecated
    public static void copyPackageToDest(File srcPackDir, PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException{

        final String newPackName = packageMetadata.getPackageName();
        for (String hospCode: packageMetadata.getFinalHospDest()){
            try {
                String destPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + newPackName;
                File dest = new File(destPath);
                if(dest.exists()){
                    String packBackupPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\_AutoBackup\\" + newPackName;
                    relocatePackToBackup(dest, packBackupPath);
                }
                copyDirectory(srcPackDir, dest);
                // messagingTemplate.convertAndSend(notifyClientPath, "Package copied to " + hospCode + " at:\n" + destPath);
            }catch(IOException e){
                throw new IOException("Destination directory for \"" + hospCode + "\" does not exist.");
            }
        }
    }*/

    public static Map<String, Object> searchWorkStationsByHospAndFlag(String notifyClientPath, String hospCode, String flag, SimpMessagingTemplate messagingTemplate){

        final int wsCapacity = 5000;
        ConfigParameters configParameters = ConfigParameters.getInstance();
        String hospCFGPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getCFGFolderRelPath();

        List<HospWorkstation> hasFlag = new ArrayList<>(wsCapacity);
        List<HospWorkstation> noFlag = new ArrayList<>(wsCapacity);

        try{
            DirectoryStream<Path> wsStream = Files.newDirectoryStream(Paths.get(hospCFGPath));
            String searchMsg = "Searching " + hospCode + "'s workstations for \"" + flag + "\" ...";
            messagingTemplate.convertAndSend(notifyClientPath, searchMsg);
            for (Path currWS: wsStream){
                if (Files.isDirectory(currWS)){
                    String wsName = currWS.getFileName().toString();
                    if (!validWS(wsName)) continue;
                    String flagPathString = currWS + "\\" + flag;
                    Path flagPath = Paths.get(flagPathString);
                    if (Files.exists(flagPath) && Files.isRegularFile(flagPath)){
                        hasFlag.add(new HospWorkstation(wsName, wsName));
                    }else{
                        noFlag.add(new HospWorkstation(wsName, wsName));
                    }
                }
            }
            messagingTemplate.convertAndSend(notifyClientPath, "DONE!");
        }catch (IOException e) {
            String errorMsg = "CRITICAL: Error accessing " + hospCode + "'s CFG directory error.";
            messagingTemplate.convertAndSend(notifyClientPath, errorMsg);
        }

        int hasFlagCnt = hasFlag.size(), noFlagCnt = noFlag.size();

        Map<String, Object> results = new LinkedHashMap<>(5);
        results.put("Hospital", hospCode);
        results.put("hasFlag_count", hasFlagCnt);
        results.put("noFlag_count", noFlagCnt);
        results.put("hasFlag", hasFlag);
        results.put("noFlag", noFlag);

        return results;
    }

    private static boolean validWS(String WSName){
        int digitCnt = 0;
        for (char c: WSName.toCharArray()){
            if (c == '_') return false;
            if (Character.isLowerCase(c)) return false;
            if (Character.isDigit(c)) digitCnt++;
        }
        if(digitCnt == WSName.length()) return false;
        return true;
    }

    public static void deleteFlagFromWorkStations(String flagName, String hospCode, ArrayList<String> workStations, String notifyClientPath, SimpMessagingTemplate messagingTemplate) {
        ConfigParameters configParameters = ConfigParameters.getInstance();
        String hospCFGFolder = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getCFGFolderRelPath();
        List<String> successWS = new ArrayList<>(workStations.size());
        List<String> failWS = new ArrayList<>();

        String delMsg = "Deleting \"" + flagName + "\" for " + hospCode + "'s selected workstations ...";
        messagingTemplate.convertAndSend(notifyClientPath, delMsg);

        for (String currWS: workStations){
            Path currFlagPath = Paths.get(hospCFGFolder, currWS, flagName);
            try{
                if(Files.exists(currFlagPath) && !Files.isDirectory(currFlagPath)){
                    Files.delete(currFlagPath);
                    successWS.add(currWS);
                }else{
                    String warningMsg = "WARNING: " + currWS + " has no \"" + flagName + "\" for deletion.";
                    messagingTemplate.convertAndSend(notifyClientPath, warningMsg);
                }
            }catch (IOException e){
                String errorMsg = "CRITICAL: Flag deletion error in " + currWS;
                messagingTemplate.convertAndSend(notifyClientPath, errorMsg);
                failWS.add(currWS);
            }
        }
        if (!successWS.isEmpty()){
            messagingTemplate.convertAndSend(notifyClientPath, "Completed workstation(s): " + successWS);
        }
        if (!failWS.isEmpty()){
            messagingTemplate.convertAndSend(notifyClientPath, "CRITICAL: Failed workstation(s): " + failWS);
        }
    }

    public static void addFlagToWorkStations(String flagName, String hospCode, ArrayList<String> workStations, String notifyClientPath, SimpMessagingTemplate messagingTemplate){
        ConfigParameters configParameters = ConfigParameters.getInstance();
        String hospCFGFolder = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getCFGFolderRelPath();

        List<String> successWS = new ArrayList<>(workStations.size());
        List<String> failWS = new ArrayList<>();

        String addMsg = "Adding \"" + flagName + "\" for " + hospCode + "'s selected workstations ...";
        messagingTemplate.convertAndSend(notifyClientPath, addMsg);

        for (String currWS: workStations){
            Path currFlagPath = Paths.get(hospCFGFolder, currWS, flagName);
            try{
                if (!Files.exists(currFlagPath)){
                    Files.createFile(currFlagPath);
                    successWS.add(currWS);
                }else if(Files.isDirectory(currFlagPath)){
                    String failMsg = "CRITICAL: Flag creation error in " + currWS + " as a folder with the same name already exists!";
                    messagingTemplate.convertAndSend(notifyClientPath, failMsg);
                    failWS.add(currWS);
                }else{
                    String warningMsg = "WARNING: " + currWS + " already has \"" + flagName + "\". Flag was not added.";
                    messagingTemplate.convertAndSend(notifyClientPath, warningMsg);
                }
            }catch (IOException e){
                String errorMsg = "CRITICAL: Flag creation error in " + currWS;
                messagingTemplate.convertAndSend(notifyClientPath, errorMsg);
                failWS.add(currWS);
            }
        }
        if (!successWS.isEmpty()){
            messagingTemplate.convertAndSend(notifyClientPath, "Completed workstation(s): " + successWS);
        }
        if (!failWS.isEmpty()){
            messagingTemplate.convertAndSend(notifyClientPath, "CRITICAL: Failed workstation(s): " + failWS);
        }
    }

    public static Map<String, List<HospWorkstation>> getExistingPackageWSMG(String packageName, ArrayList<String> finalHospDest, String notifyClientPath, SimpMessagingTemplate messagingTemplate){
        ConfigParameters configParameters = ConfigParameters.getInstance();
        Map<String, List<HospWorkstation>> results = new LinkedHashMap<>(finalHospDest.size() * 2);

        for (String hospCode: finalHospDest){
            String hospDir = configParameters.getHospPackageDirectories().get(hospCode);
            String packPath = hospDir + configParameters.getPackageFolderRelPath() + "\\" + packageName;
            List <HospWorkstation> retrievedWS = new ArrayList<>();
            List <HospWorkstation> retrievedMG = new ArrayList<>();
            try{
                if (Files.isDirectory(Paths.get(packPath))){
                    String tasklistPath =  hospDir + configParameters.getIniFolderRelPath() + "\\tasklist.ini";
                    Wini tasklistFile = new Wini(new File(tasklistPath));
                    List<String> allKeys = new ArrayList<>(tasklistFile.keySet());
                    for (String key: allKeys){
                        if(!key.equals("Tasks") && !key.equals("?")){
                            String currPackName = tasklistFile.get(key).get("Packages");
                            if (currPackName.equals(packageName)){
                                String informMsg = "Found existing \"" + currPackName + "\" in " + hospCode + "'s tasklist.ini";
                                messagingTemplate.convertAndSend(notifyClientPath, informMsg);

                                String existingWS = tasklistFile.get(key).get("WorkStations");
                                String existingMG = tasklistFile.get(key).get("MachineGroups");

                                String[] existingWSArray = existingWS.split(",");
                                String[] existingMGArray = existingMG.split(",");

                                for (String WS: existingWSArray){
                                    String modifiedWSString = WS.strip();
                                    retrievedWS.add(new HospWorkstation(modifiedWSString,modifiedWSString));
                                }

                                for (String MG: existingMGArray){
                                    String modifiedMGString = MG.strip();
                                    retrievedMG.add(new HospWorkstation(modifiedMGString,modifiedMGString));
                                }
                                break;
                            }
                        }
                    }
                }
                results.put(hospCode + "_WS", retrievedWS);
                results.put(hospCode + "_MG", retrievedMG);
            }catch(IOException e){
                String errorMsg = "CRITICAL: Error reading " + hospCode + "'s tasklist.ini\n" + e;
                messagingTemplate.convertAndSend(notifyClientPath, errorMsg);
            }
        }
        messagingTemplate.convertAndSend(notifyClientPath, "WorkStations and MachineGroups query complete!");
        return results;
    }
}
