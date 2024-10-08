package org.packageManipulation;

import org.packageManipulation.Components.HospWorkstation;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;


@Controller
@CrossOrigin
@RequestMapping(value = "/api")
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @ResponseBody
    @PostMapping(path = "/submitForm", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> receivePackage(@RequestParam("packageFile") MultipartFile packageFile,
                              @RequestParam("finalHospDest") ArrayList<String> finalHospDest,
                              @RequestParam("packDesc") String packDesc,
                              @RequestParam("packDescAction") String packDescAction,
                              @RequestParam("packUpdateStaff")String packUpdateStaff,
                              @RequestParam("workStations") String workStations,
                              @RequestParam("machineGroups") String machineGroups,
                              @RequestParam("sessionId") String sessionId) {


        ConfigParameters configParameters = ConfigParameters.getInstance();

        String notifyClientPath = "/queue/afterFormSubmit/" + sessionId;

        String packageName = packageFile.getOriginalFilename().replaceAll(".zip", "");

        String alertErrorMsg = "Error processing submitted package data. Operation aborted.";

        try{
            PackageMetadata packageMetadata = new PackageMetadata(
                    packageFile,
                    packageName,
                    finalHospDest,
                    packDesc,
                    packDescAction,
                    packUpdateStaff,
                    Helper.customJSONObjToJavaMap(workStations),
                    Helper.customJSONObjToJavaMap(machineGroups),
                    notifyClientPath,
                    messagingTemplate);

            Helper.startOperation(packageMetadata, configParameters);
            return Collections.singletonMap("response", "All backend operations completed.");

        }catch(IOException e){
            messagingTemplate.convertAndSend(notifyClientPath, e.toString());
            messagingTemplate.convertAndSend(notifyClientPath, alertErrorMsg);
            return Collections.singletonMap("response", e.toString() + "\n\n" + alertErrorMsg);
        }
    }

    @ResponseBody
    @PostMapping(path = "/delete-flag")
    public Map<String, String> deleteFlag(@RequestParam("flagName") String flagName,
                          @RequestParam("hospCode") String hospCode,
                          @RequestParam("workStations") ArrayList<String> workStations,
                          @RequestParam("sessionId") String sessionId){
        String notifyClientPath = "/queue/afterFormSubmit/" + sessionId;
        Helper.deleteFlagFromWorkStations(flagName, hospCode, workStations, notifyClientPath, messagingTemplate);
        return Collections.singletonMap("Response", "Received data from backend.");
    }

    @ResponseBody
    @PostMapping(path = "/add-flag")
    public Map<String, String> addFlag(@RequestParam("flagName") String flagName,
                       @RequestParam("hospCode") String hospCode,
                       @RequestParam("workStations") ArrayList<String> workStations,
                       @RequestParam("sessionId") String sessionId){
        String notifyClientPath = "/queue/afterFormSubmit/" + sessionId;
        Helper.addFlagToWorkStations(flagName, hospCode, workStations, notifyClientPath, messagingTemplate);
        return Collections.singletonMap("Response", "Received data from backend.");
    }

    @MessageMapping("/connect/getSessionId")
    @SendToUser("/queue/returnSessionId")
    public String sendBackToUser(@Payload String message, @Header("simpSessionId") String sessionId) {
        return sessionId;
    }

    @ResponseBody
    @GetMapping(path = "/{sessionId}/search-flag/{hospCode}/{flag}")
    public Map<String, Object> getWorkstationsByHospAnfFlag(@PathVariable("sessionId") String sessionId,
                                                            @PathVariable("hospCode") String hospCode,
                                                            @PathVariable("flag") String flag){
        String notifyClientPath = "/queue/afterFormSubmit/" + sessionId;
        return Helper.searchWorkStationsByHospAndFlag(notifyClientPath, hospCode, flag, messagingTemplate);
    }

    @ResponseBody
    @PostMapping(path = "/get-WS-MG")
    public Map<String, List<HospWorkstation>> deleteFlag(@RequestParam("packageName") String packageName,
                                                         @RequestParam("finalHospDest") ArrayList<String> finalHospDest,
                                                         @RequestParam("sessionId") String sessionId){
        String notifyClientPath = "/queue/afterFormSubmit/" + sessionId;
        return Helper.getExistingPackageWSMG(packageName, finalHospDest, notifyClientPath, messagingTemplate);
    }
}
