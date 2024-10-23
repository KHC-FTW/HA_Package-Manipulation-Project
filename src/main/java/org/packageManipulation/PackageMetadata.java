package org.packageManipulation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PackageMetadata {
    private MultipartFile packageFile;
    private String packageName;
    private List<String> finalHospDest;
    private String packDesc;
    private String packDescAction;
    private String packUpdateStaff;
    private Map<String, String> workStations;
    private Map<String, String> machineGroups;
    private String notifyClientPath;
    private SimpMessagingTemplate messagingTemplate;

    public PackageMetadata(String packageName,
                           List<String> finalHospDest,
                           String packDesc,
                           String packDescAction,
                           String packUpdateStaff,
                           Map<String, String> workStation,
                           Map<String, String> machineGroups,
                           String notifyClientPath,
                           SimpMessagingTemplate messagingTemplate){
        this.packageName = packageName;
        this.finalHospDest = finalHospDest;
        this.packDesc = packDesc;
        this.packDescAction = packDescAction;
        this.packUpdateStaff = packUpdateStaff;
        this.workStations = workStation;
        this.machineGroups = machineGroups;
        this.notifyClientPath = notifyClientPath;
        this.messagingTemplate = messagingTemplate;
    }
}
