# Pending Requests Data Storage Info

## 1. Are pending requests stored in the database?

**YES.**
All visitor requests, including those with a `PENDING` status, are stored in your application's connected database.

## 2. Which table are they stored in?

Based on the backend project structure (`Visitor.java` entity), the data is stored in a table named:

- **`visitor`** (Default JPA naming)
  OR
- **`visitors`** (Common convention if customized)

## 3. How does the Frontend get this data?

1.  **API Call**: The frontend calls `GET /api/visitors` (defined in `visitorService.js`).
2.  **Backend Retrieval**: The Spring Boot backend (`VisitorController`) fetches **ALL** visitor records from the `visitor` table in the database.
3.  **Frontend Filtering**: The `PendingApprovalsTable.jsx` component receives all visitors and filters them in the browser:
    ```javascript
    const pendingVisitors = data.filter((v) => v.status === "PENDING");
    ```

## Summary

- **Database**: Yes (Your local SQL database).
- **Table**: `visitor` or `visitors`.
- **Column**: There is a `status` column in this table that will have the value `'PENDING'` for these requests.

## 4. What happens when I click "Pre-Register"?

1.  **User Action**: You click the "Pre-Register for Approval" button in `VisitorCheckInForm.jsx`.
2.  **Frontend Logic**: The `handleSubmit` function is called with the action `'preregister'`.
3.  **API Request**: The app sends a **POST** request to `http://localhost:8080/api/visitors/preregister` with the visitor's details and photo.
4.  **Backend Processing**:
    - The Backend receives this request.
    - It creates a new `Visitor` record in the database.
    - It sets the status of this record to `'PENDING'`.
5.  **Storage**: The record is saved in the **`visitor`** table in your SQL database.

## 5. Can we store approval requests in a separate `approvals` table?

**Yes, absolutely.** You can separate the data into two tables: `visitors` (for personal info) and `approvals` (for request status).

### 
1.  **DatabaHow it would work:
se Structure**:

    - **`visitors` table**: Stores `id`, `name`, `email`, `photo`, `company`.
    - **`approvals` table**: Stores `id`, `visitor_id`, `host_id`, `status` (PENDING, APPROVED, REJECTED, CHECKED_IN), `request_date`.

2.  **Backend Changes**:

    - When a user clicks "Pre-Register", the backend saves the person in `visitors` AND creates a record in `approvals` with status `PENDING`.
    - The API `GET /api/visitors` would need to join these two tables to return the visitor info + their current status.

3.  **Frontend Impact**:
    - The **Pending Approvals Table** would still work exactly the same way!
    - It would receive a list of items containing `{ visitorName, status, ... }`.
    - It would display the status (PENDING, CHECKED_IN, etc.) just as it does now.

### Recommendation

For a VMS (Visitor Management System), the current approach (single table with a `status` column) is **simpler and more efficient** unless you need to track a history of multiple visits for the same person. If a visitor comes back multiple times, a separate `visits` or `approvals` table is better to keep a history of every visit.

## 6. Approvals Table UI & Behavior Specification

To meet your specific requirements, the Approvals Table is designed as follows:

### Columns to Display

1.  **VISITOR**: Name and Photo of the visitor.
2.  **HOST AND COMPANY NAME**: The person and company they are visiting.
3.  **STATUS**: Current state (e.g., `PENDING`, `CHECKED_IN`, `REJECTED`).
4.  **ACTION**: Interactive buttons for the admin.

### Action Buttons

- ✅ **Tick Mark (Approve)**: Updates status to `APPROVED`.
- ❌ **Cross Mark (Reject)**: Updates status to `REJECTED`.

### Data Persistence (Rejections)

- **Do rejected requests get deleted?** **NO.**
- **Storage**: Rejected visitors are **kept in the database table**.
- **Status**: Their status column is simply updated to `'REJECTED'`.
- **Visibility**: They can remain in the table (marked as Rejected) or be moved to a "History/Rejected" list, ensuring you have a full record of all requests.
