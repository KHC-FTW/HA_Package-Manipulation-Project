package org.packageManipulation;

import java.io.*;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.Date;

public class BatFileService {

    private final static Charset Big5_HKSCS = Charset.forName("Big5-HKSCS"); //Big5 with Hong Kong extensions, Traditional Chinese (incorporating 2001 revision)
    private final static Charset Cp950 = Charset.forName("x-IBM950"); // PC Chinese (Hong Kong, Taiwan)
    private final static Charset MS950_HKSCS = Charset.forName("x-MS950-HKSCS"); //Windows Traditional Chinese with Hong Kong extensions

    public static Boolean addRemToPackageAutorun(String srcPackagePath) throws IOException {

        File srcAutorun = new File(srcPackagePath + "\\autorun.bat");
        if (!srcAutorun.exists()) return false;
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyyMMdd").format(date);
        String srcAutorunFileName = srcAutorun.getCanonicalFile().getName();
        File renamedAutorun = new File(srcPackagePath + "\\autorun (temp_" + formattedDate + ").bat");

        boolean renameSuccess = srcAutorun.renameTo(renamedAutorun);
        File modifiedAutorun = new File(srcPackagePath + "\\" + srcAutorunFileName);

        if (renameSuccess && !modifiedAutorun.exists()){
            try(BufferedReader reader = new BufferedReader(new FileReader(renamedAutorun, Big5_HKSCS));
                BufferedWriter writer = new BufferedWriter(new FileWriter(modifiedAutorun, Big5_HKSCS))){
                String line;
                StringBuilder content = new StringBuilder();

                // Read the file line by line
                while ((line = reader.readLine()) != null) {
                    String lineLC = line.toLowerCase();
                    if ((lineLC.contains("set_fd") || lineLC.contains("netlogon") || lineLC.contains("filedist")) && !lineLC.contains("rem")){
                        String remAdded = "rem " + line;
                        content.append(remAdded);
                    }else content.append(line);
                    content.append(System.lineSeparator());
                }

                // Write the modified content to the new file
                writer.write(content.toString());
            }finally {
                renamedAutorun.delete();
            }
        }else throw new IOException("CRITICAL: Error adding rem to autorun.bat");
        return true;
    }

    public static void updateReconfig_w(String hospCode, PackageMetadata packageMetadata, ConfigParameters configParameters) throws IOException{
        String reconfigFileName = configParameters.getReconfigWin();
        String packageName = packageMetadata.getPackageName();
        String reconfigPath = configParameters.getHospPackageDirectories().get(hospCode) + configParameters.getPackageFolderRelPath() + "\\" + reconfigFileName;

        File srcReconfig = new File(reconfigPath + "\\autorun.bat");

        if (!srcReconfig.exists()){
            String failedMsg = "CRITICAL: " + hospCode + " does not have \"" + reconfigFileName + "\" or \"autorun.bat\". No update is done.";
            packageMetadata.getMessagingTemplate().convertAndSend(packageMetadata.getNotifyClientPath(), failedMsg);
            return;
        }

        // will not update itself
        if (reconfigFileName.equalsIgnoreCase(packageName)) return;

        File reconfigToBackupFile = moveSrcReconfigAutorunToBackup(reconfigPath, srcReconfig);

        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(date);

        File updatedReconfig = new File(reconfigPath + "\\" + srcReconfig.getName());

        if (!updatedReconfig.exists()){
            try(BufferedReader reader1 = new BufferedReader(new FileReader(reconfigToBackupFile, Big5_HKSCS));
                BufferedReader reader2 = new BufferedReader(new FileReader(reconfigToBackupFile, Big5_HKSCS));
                BufferedWriter writer = new BufferedWriter(new FileWriter(updatedReconfig, Big5_HKSCS))){

                String line;
                StringBuilder contentResult = new StringBuilder();
                String newDelMsg = "\nrem Note: line below was automatically added by script (" + formattedDate + ")\ndel %FD%\\CFG\\%ward%\\" + packageName;

                int delCnt1 = 0, delCnt2 = 0;
                String toCompare = ("%FD%\\CFG\\%ward%\\" + packageName).toLowerCase();
                boolean targetAlreadyExists = false;
                // Read the file line by line
                while ((line = reader1.readLine()) != null) {
                    String lineLC = line.toLowerCase();
                    if (lineLC.contains("del")){
                        delCnt1++;
                    }
                    if (lineLC.contains(toCompare) && lineLC.contains("del") && !lineLC.contains("rem")){
                        targetAlreadyExists = true;
                        break;
                    }
                }

                if(targetAlreadyExists){
                    while ((line = reader2.readLine()) != null) {
                        contentResult.append(line).append(System.lineSeparator());
                    }
                }else{
                    while ((line = reader2.readLine()) != null) {
                        String lineLC = line.toLowerCase();
                        if (lineLC.contains("del")){
                            delCnt2++;
                            if (delCnt1 == delCnt2){
                                line += newDelMsg;
                            }
                        }
                        contentResult.append(line).append(System.lineSeparator());
                    }
                }

                // Write the modified content to the new file
                writer.write(contentResult.toString());

            }
        }else throw new IOException("CRITICAL: Error updating " + configParameters.getReconfigWin());
    }

    private static File moveSrcReconfigAutorunToBackup(String reconfigPath, File srcReconfig) throws IOException{
        String autoBackFolderPath = reconfigPath + "\\_AutoBackup";
        File autoBackupFolder = new File(autoBackFolderPath);

        if (!autoBackupFolder.exists()){
            Boolean createBackupDirSuccess = autoBackupFolder.mkdirs();
            if (!createBackupDirSuccess) throw new IOException("Failed to backup folder for reconfig autorun.bat.Please check manually.");
        }
        Date date = new Date();
        String formattedDate = new SimpleDateFormat("yyyyMMdd").format(date);
        String srcReconfigNameNoExt = srcReconfig.getName().replaceAll("(?i).bat", "");
        String reconfigToBackupPath = autoBackFolderPath + "\\" + srcReconfigNameNoExt + "_" + formattedDate + ".bat";
        File reconfigToBackupFile = new File(reconfigToBackupPath);
        int dulCnt = 1;
        while(reconfigToBackupFile.exists()){
            reconfigToBackupPath = autoBackFolderPath + "\\" + srcReconfigNameNoExt + "_" + formattedDate + " (" + dulCnt + ").bat";
            reconfigToBackupFile = new File(reconfigToBackupPath);
            dulCnt++;
        }
        Boolean moveSuccess = srcReconfig.renameTo(reconfigToBackupFile);
        if (!moveSuccess) throw new IOException("Failed to move old reconfig autorun.bat to backup folder.Please check manually.");
        return reconfigToBackupFile;

    }
}
