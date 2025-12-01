package com.vms.backend.controller;

import com.vms.backend.dto.VisitorRequest;
import com.vms.backend.dto.VisitorDTO;
import com.vms.backend.entity.Approval;
import com.vms.backend.entity.Visitor;
import com.vms.backend.service.VisitorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // Ensure CORS is enabled
public class VisitorController {

    @Autowired
    private VisitorService visitorService;

    @Autowired
    private ObjectMapper objectMapper;

    // 1. REGISTER (POST /register) -> Creates Visitor + Approval (PENDING)
    // FIXED: Explicitly consumes MULTIPART_FORM_DATA and uses @RequestPart for JSON string
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Approval> registerVisitor(
            @RequestPart("visitorJsonData") String visitorJsonData,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        
        try {
            // Manually convert the JSON string to VisitorDTO
            VisitorDTO request = objectMapper.readValue(visitorJsonData, VisitorDTO.class);
            
            // Call service
            Approval approval = visitorService.preRegisterVisitor(request, photo);
            return ResponseEntity.ok(approval);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. CHECKIN (PATCH /{id}/checkin) -> Mark CHECKED_IN + record inTime
    @PatchMapping("/{id}/checkin")
    public ResponseEntity<Approval> checkInVisitor(@PathVariable Long id) {
        try {
            Approval approval = visitorService.checkInApprovedVisitor(id);
            return ResponseEntity.ok(approval);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 3. CHECKOUT (PATCH /{id}/checkout) -> Mark CHECKED_OUT + record outTime
    @PatchMapping("/{id}/checkout")
    public ResponseEntity<Approval> checkoutVisitor(@PathVariable Long id) {
        try {
            Approval approval = visitorService.checkoutVisit(id);
            return ResponseEntity.ok(approval);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ------------------ EXISTING / COMPATIBILITY ENDPOINTS ------------------

    // IMMEDIATE CHECK-IN (POST /checkin)
    @PostMapping(value = "/checkin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Approval> immediateCheckIn(
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestParam(value = "visitor", required = false) String visitor,
            @RequestParam(value = "visitorJsonData", required = false) String visitorJsonData) {

        try {
            MultipartFile file = (photo != null) ? photo : photoFile;
            String json = (visitor != null) ? visitor : visitorJsonData;

            if (json == null) {
                throw new RuntimeException("Required part 'visitor' or 'visitorJsonData' is not present");
            }

            VisitorRequest request = objectMapper.readValue(json, VisitorRequest.class);
            Approval approval = visitorService.checkInVisitor(request, file);
            return ResponseEntity.ok(approval);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // PRE-REGISTER (POST /preregister) - Alias to /register
    @PostMapping(value = "/preregister", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Approval> preRegister(
            @RequestPart("visitorJsonData") String visitorJsonData,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        return registerVisitor(visitorJsonData, photo);
    }

    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitors();
    }

    @GetMapping("/{id}")
    public Visitor getVisitorById(@PathVariable Long id) {
        return visitorService.getVisitorById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteVisitor(@PathVariable Long id) {
        visitorService.deleteVisitor(id);
    }
}
