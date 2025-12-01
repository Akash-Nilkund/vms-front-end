# Backend Changes Required

To fully support the "ID Proof" and "Gender" fields, please apply the following changes to your Spring Boot backend.

## 1. Update Visitor Entity

**File:** `src/main/java/com/vms/backend/model/Visitor.java`

Add the following fields to the `Visitor` class:

```java
@Column(name = "id_proof")
private String idProof;

@Column(name = "gender")
private String gender;

// Add Getters and Setters
public String getIdProof() { return idProof; }
public void setIdProof(String idProof) { this.idProof = idProof; }

public String getGender() { return gender; }
public void setGender(String gender) { this.gender = gender; }
```

## 2. Update Visitor DTO

**File:** `src/main/java/com/vms/backend/dto/VisitorRequest.java` (or similar DTO used for registration)

Add the fields to the DTO:

```java
private String idProof;
private String gender;

// Add Getters and Setters
```

**File:** `src/main/java/com/vms/backend/service/VisitorService.java`

Ensure the `registerVisitor` method maps these fields from the DTO to the Entity:

```java
visitor.setIdProof(request.getIdProof());
visitor.setGender(request.getGender());
```

## 3. Update PDF Service

**File:** `src/main/java/com/vms/backend/service/PdfService.java`

Update the PDF generation logic to include these fields in the pass.

```java
// Example: Adding ID Proof and Gender to the PDF table or layout
table.addCell(new Cell().add(new Paragraph("ID Proof")));
table.addCell(new Cell().add(new Paragraph(visitor.getIdProof() != null ? visitor.getIdProof() : "N/A")));

table.addCell(new Cell().add(new Paragraph("Gender")));
table.addCell(new Cell().add(new Paragraph(visitor.getGender() != null ? visitor.getGender() : "N/A")));
```

## 4. Database Migration (Optional)

If you are using Hibernate `ddl-auto=update`, the columns will be added automatically. Otherwise, run:

```sql
ALTER TABLE visitors ADD COLUMN id_proof VARCHAR(255);
ALTER TABLE visitors ADD COLUMN gender VARCHAR(255);
```
