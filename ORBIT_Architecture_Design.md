# ORBIT: Hospital Operations Operating System
## Technical Architecture & Design Document

**Version:** 1.1 (Refined & hardened)
**Status:** DRAFT
**Architect:** System Architect (AntiGravity)

---

## SECTION 1 — COMPLETE FEATURE INVENTORY (EXHAUSTIVE)

### ROLE: DOCTOR

#### Feature: Delay Declaration
- **Trigger:** Doctor (via Mobile/Desktop) or System (Autodetected lateness)
- **Preconditions:** Doctor has active schedule block for current day.
- **Data Read:** Current schedule, current queue depth.
- **Data Written:** `DoctorStatus`, `ScheduleBlock` (deployment of time shift).
- **Events Emitted:** `DOCTOR_DELAY_DECLARED`, `QUEUE_RECALCULATION_TRIGGERED`, `NOTIFICATIONS_DISPATCHED`.
- **Events Consumed:** N/A.
- **Permissions:** `doctor.status.update`.
- **Failure Cases:** Network timeout (store locally & retry), API error (fallback to SMS override).
- **Fallback Behavior:** If app fails, doctor sends SMS to Gateway -> System parses -> triggers event.

#### Feature: Start Consultation
- **Trigger:** Doctor clicking "Call Patient".
- **Preconditions:** Patient is checked-in, Doctor is in `AVAILABLE` state.
- **Data Read:** `PatientWaitTime`, `VisitHistory`, `TriageNotes`.
- **Data Written:** `Visit` (status -> IN_CONSULTATION), `ConsultationLog` (start_time).
- **Events Emitted:** `CONSULTATION_STARTED`, `QUEUE_UPDATED`, `DISPLAY_BOARD_UPDATED`.
- **Events Consumed:** N/A.
- **Permissions:** `visit.conduct`.
- **Failure Cases:** Concurrent edit (optimistic lock error).
- **Fallback Behavior:** Allow proceed, flag for reconciliation.

#### Feature: Emergency Insertion (Code Red)
- **Trigger:** Doctor.
- **Preconditions:** Immediate threat to life/limb.
- **Data Read:** N/A.
- **Data Written:** `EmergencyOverride` record, `Queue` (inject at head).
- **Events Emitted:** `EMERGENCY_DECLARED`, `QUEUE_FROZEN`, `ADMIN_ALERTED`.
- **Events Consumed:** N/A.
- **Permissions:** `doctor.emergency_override` (Audited).
- **Failure Cases:** System unavailable.
- **Fallback Behavior:** Physical protocol (red flag), retrospective entry.

#### Feature: Extend Consultation (Complication)
- **Trigger:** Doctor.
- **Preconditions:** Current consultation > allocated time.
- **Data Read:** Current queue metrics.
- **Data Written:** `Visit` (expected_duration updated).
- **Events Emitted:** `CONSULTATION_EXTENDED`, `QUEUE_DELAY_PROPAGATED`.
- **Events Consumed:** N/A.
- **Permissions:** `consultation.extend`.
- **Failure Cases:** N/A.
- **Fallback Behavior:** System auto-extends based on heuristic if no manual input.

#### Feature: End Consultation & Disposition
- **Trigger:** Doctor.
- **Preconditions:** Consultation active.
- **Data Read:** N/A.
- **Data Written:** `Visit` (status -> COMPLETED), `Prescription` (optional), `FollowUp` (optional).
- **Events Emitted:** `CONSULTATION_ENDED`, `BILLING_TRIGGERED`, `PHARMACY_NOTIFIED`.
- **Events Consumed:** N/A.
- **Permissions:** `visit.complete`.
- **Failure Cases:** Saving fails.
- **Fallback Behavior:** Local cache, retry on reconnect. Do not block next patient.

### ROLE: RECEPTIONIST

#### Feature: Walk-in Registration (Fast Track)
- **Trigger:** Receptionist.
- **Preconditions:** Patient physically present.
- **Data Read:** `PatientIndex` (search by phone/name).
- **Data Written:** `Patient` (if new), `Visit` (status -> ARRIVED).
- **Events Emitted:** `PATIENT_REGISTERED`, `QUEUE_JOINED`.
- **Events Consumed:** N/A.
- **Permissions:** `reception.register`.
- **Failure Cases:** Duplicate patient found.
- **Fallback Behavior:** Force selection logic or "Provisional" ID merge later.

#### Feature: Check-in (Appointment)
- **Trigger:** Receptionist.
- **Preconditions:** Existing `Appointment` for today.
- **Data Read:** `Appointment` details.
- **Data Written:** `Visit` (linked to appointment, status -> WAITING).
- **Events Emitted:** `PATIENT_CHECKED_IN`, `NO_SHOW_RISK_REDUCED`.
- **Events Consumed:** N/A.
- **Permissions:** `reception.checkin`.
- **Failure Cases:** Appointment not found (convert to Walk-in).
- **Fallback Behavior:** Manual override to "Walk-in" bucket with high priority if valid proof shown.

#### Feature: Queue Override (VIP/Angry Patient)
- **Trigger:** Receptionist.
- **Preconditions:** Patient in queue.
- **Data Read:** Queue position.
- **Data Written:** `QueueOverrideLog` (reason required), `Visit` (priority_score boosted).
- **Events Emitted:** `QUEUE_OVERRIDE_APPLIED`, `ADMIN_ALERT_AUDIT`.
- **Events Consumed:** N/A.
- **Permissions:** `reception.override` (Requires Reason Code).
- **Failure Cases:** Permission denied.
- **Fallback Behavior:** Escalation request to Admin.

#### Feature: Mark Patient Unreachable (Skip)
- **Trigger:** Receptionist (after 3 calls).
- **Preconditions:** Patient top of queue.
- **Data Read:** N/A.
- **Data Written:** `Visit` (status -> SKIPPED), `SkippedLog`.
- **Events Emitted:** `PATIENT_SKIPPED`, `QUEUE_ADVANCED`.
- **Events Consumed:** N/A.
- **Permissions:** `reception.queue_manage`.
- **Failure Cases:** Patient returns immediately.
- **Fallback Behavior:** Re-insert with penalty (n+3 positions).

### ROLE: ADMIN

#### Feature: Operational Policy Adjustment
- **Trigger:** Admin.
- **Preconditions:** N/A.
- **Data Read:** Current rules config.
- **Data Written:** `HospitalPolicy` (e.g., "Stop Walk-ins").
- **Events Emitted:** `POLICY_CHANGED`, `SYSTEM_CONFIGURATION_UPDATED`.
- **Events Consumed:** N/A.
- **Permissions:** `admin.policy`.
- **Failure Cases:** Invalid config.
- **Fallback Behavior:** Revert to last known good config.

#### Feature: Real-time Slot Blocking
- **Trigger:** Admin.
- **Preconditions:** Doctor unavailable/emergency.
- **Data Read:** Schedule.
- **Data Written:** `ScheduleBlock` (type -> BLOCKED).
- **Events Emitted:** `SLOTS_BLOCKED`, `RESCHEDULING_INITIATED`.
- **Events Consumed:** N/A.
- **Permissions:** `admin.schedule`.
- **Failure Cases:** N/A.
- **Fallback Behavior:** N/A.

### ROLE: CFO / OWNER

#### Feature: Real-time Revenue View
- **Trigger:** Dashboard load.
- **Preconditions:** Credential check.
- **Data Read:** `BillingTransactions`, `VisitStats`.
- **Data Written:** `AuditLog` (viewed).
- **Events Emitted:** N/A.
- **Events Consumed:** `BILLING_COMPLETED`.
- **Permissions:** `view.revenue`.
- **Failure Cases:** Data lag.
- **Fallback Behavior:** Show "Last updated X mins ago".

### ROLE: PATIENT

#### Feature: Live Queue Status View
- **Trigger:** Patient loading tracking URL.
- **Preconditions:** Valid Visit ID/Token.
- **Data Read:** `QueueDerivedState` (Estimated time, Position).
- **Data Written:** `EngagementMetric`.
- **Events Emitted:** N/A.
- **Events Consumed:** `QUEUE_UPDATED`.
- **Permissions:** Public (Tokenized).
- **Failure Cases:** Token expired.
- **Fallback Behavior:** Request phone number for generic status.

#### Feature: "I am Leaving" (Early Return)
- **Trigger:** Patient.
- **Preconditions:** In Queue.
- **Data Read:** N/A.
- **Data Written:** `Visit` (status -> DROPPED_OUT), `DropoutReason`.
- **Events Emitted:** `PATIENT_LEFT_QUEUE`, `SLOT_FREED`.
- **Events Consumed:** N/A.
- **Permissions:** Tokenized.
- **Failure Cases:** N/A.
- **Fallback Behavior:** N/A.

### ROLE: SYSTEM (AUTONOMOUS)

#### Feature: Auto-Reschedule Non-Urgent
- **Trigger:** `DOCTOR_DELAY_EXTENDED` event & predicted overflow.
- **Preconditions:** Visits > Capacity + Overtime limit.
- **Data Read:** `Visit` priority, `Patient` history.
- **Data Written:** `Visit` (new_time), `NotificationQueue`.
- **Events Emitted:** `AUTO_RESCHEDULED`, `PATIENT_NOTIFIED`.
- **Events Consumed:** `DOCTOR_DELAY_EXTENDED`.
- **Permissions:** `system.root`.
- **Failure Cases:** No slots available within policy window.
- **Fallback Behavior:** Move to "Triage Queue" for human handling.

#### Feature: Missed Follow-up Handling
- **Trigger:** Cron/Time (End of Day).
- **Preconditions:** `Visit` status == WAITING at 23:59.
- **Data Read:** `Visit` list.
- **Data Written:** `Visit` (status -> NO_SHOW), `PatientScore` (reliability updated).
- **Events Emitted:** `VISIT_EXPIRED`, `NO_SHOW_RECORDED`.
- **Events Consumed:** N/A.
- **Permissions:** `system.root`.
- **Failure Cases:** N/A.
- **Fallback Behavior:** N/A.

#### Feature: Power Outage Mode
- **Trigger:** Healthbit heartbeat lost from local server OR manual flag.
- **Preconditions:** Disconnected > 5 mins.
- **Data Read:** Last synced state.
- **Data Written:** `SystemState` (mode -> OFFLINE_SYNC).
- **Events Emitted:** `POWER_OUTAGE_MODE_ACTIVATED`.
- **Events Consumed:** `HEARTBEAT_LOST`.
- **Permissions:** `system.root`.
- **Failure Cases:** False positive.
- **Fallback Behavior:** Require manual confirmation on dashboard before sending mass SMS.

## SECTION 2 — SCREEN-BY-SCREEN UX CONTRACTS

### 1. DOCTOR HOME SCREEN (Dashboard)
- **Purpose:** Immediate situational awareness + Next action trigger.
- **Who:** Doctor.
- **Components:**
  - **Status Toggle:** (Available/Break/Emergency).
  - **Live Queue Counter:** (Waiting, Checked-in, Delayed).
  - **Next Patient Card:** (Name, Age, Chief Complaint, Wait Time).
  - **Notification Ticker:** (Urgent alerts only).
- **Fields:**
  - `QueueLength` (int, computed).
  - `WaitTimeAvg` (minutes, computed).
  - `NextPatient.Name` (string, masked).
  - `DoctorStatus` (enum).
- **States:**
  - **Default:** Showing next patient, 'Call' button active.
  - **Disabled:** When status is 'Offline'.
  - **Loading:** Skeleton loader on patient card.
  - **Error:** 'Sync Failed' banner (Yellow). Button saves locally.
  - **Stress State:** If Queue > 20, background pulses amber. 'Quick consult' mode suggestion appears.
- **Forbidden Actions:** Reordering queue (must trigger admin request), Deleting patient.

### 2. DOCTOR CONSULTATION SCREEN
- **Purpose:** Clinical execution & Disposition.
- **Who:** Doctor.
- **Components:**
  - **Timer:** (Count-up, turns red after 10m).
  - **Patient History Summary:** (Last 3 visits).
  - **Prescription Pad:** (Searchable drug DB).
  - **Disposition Selector:** (Home/Admit/Refer/Follow-up).
- **Fields:**
  - `Diagnosis` (ICD-10 search).
  - `Prescription` (List[Drug]).
  - `FollowUpDate` (Date Picker).
  - `ClinicalNotes` (Text Area).
- **States:**
  - **Default:** Clean canvas.
  - **Disabled:** History read-only.
  - **Loading:** Drug search spinner.
  - **Error:** 'Prescription Not Synced'. Retry button.
  - **Stress State:** Minimal mode (hide history, show only Tx fields).
- **Forbidden Actions:** Back button without disposition.

### 3. FOLLOW-UP SCHEDULING SCREEN
- **Purpose:** Securing future revenue & care continuity.
- **Who:** Receptionist / Doctor.
- **Components:**
  - **Calendar Grid:** (Color-coded by load).
  - **Slot Picker:** (Morning/Evening/Specific).
  - **Reason Selector:** (Routine/Post-op/Wound dressing).
- **Fields:**
  - `Date` (Date).
  - `Slot` (TimeRange).
  - `Type` (Enum).
- **States:**
  - **Default:** highlighting 'Recommended' date (e.g. +7 days).
  - **Disabled:** Past dates.
  - **Loading:** Availability fetching.
  - **Error:** 'Slot Taken'. Auto-refresh.
  - **Stress State:** Show only 'Any Slot' buttons, hide specific times.
- **Forbidden Actions:** Double booking > 110% capacity.

### 4. RECEPTIONIST ASSIGNMENT SCREEN
- **Purpose:** Triage and Check-in speed.
- **Who:** Receptionist.
- **Components:**
  - **Search Bar:** (Phone/Name/UHID).
  - **Doctor Grid:** (Live status, queue depth).
  - **Quick Add:** (Walk-in button).
- **Fields:**
  - `PatientID` (String).
  - `DoctorID` (Select).
  - `PaymentStatus` (Paid/Pending).
- **States:**
  - **Default:** Focus on search.
  - **Disabled:** N/A.
  - **Loading:** Search results debounce.
  - **Error:** 'Network Error'. Local mode active (paper token entry).
  - **Stress State:** Auto-select lightest queue doctor.
- **Forbidden Actions:** Assigning to 'Leave' doctor without override code.

### 5. RECEPTIONIST CONFLICT SCREEN
- **Purpose:** Handling duplicate registrations/bookings.
- **Who:** Receptionist.
- **Components:**
  - **Conflict Card A vs B:** (Side-by-side comparison).
  - **Merge Button.**
  - **Discard New Button.**
- **Fields:**
  - `ExistingProfile` (Patient).
  - `NewInput` (Patient).
- **States:**
  - **Default:** Highlight matching fields.
  - **Disabled:** Merge if data mismatch critical.
  - **Loading:** N/A.
  - **Error:** Merge fail.
  - **Stress State:** 'Force Create New' becomes primary action to keep line moving.
- **Forbidden Actions:** Ignoring conflict (must resolve).

### 6. ADMIN REAL-TIME OPS SCREEN (The Cockpit)
- **Purpose:** God-view of hospital flow.
- **Who:** Admin / Owner.
- **Components:**
  - **Hospital Map:** (Zones with heatmaps).
  - **Alert List:** (Red text for delays > 45m).
  - **Staff Status:** (Active/Inactive).
- **Fields:**
  - `TotalWaitTime` (Aggregated).
  - `ActiveEmergencies` (Count).
  - `RevenueRealTime` (Currency).
- **States:**
  - **Default:** Auto-refresh 30s.
  - **Disabled:** N/A.
  - **Loading:** Map skeleton.
  - **Error:** 'Data Stale'.
  - **Stress State:** Turns Red. Audio alert on critical threshold.
- **Forbidden Actions:** None (Read-only mostly, but can trigger modes).

### 7. ADMIN POLICY ENGINE SCREEN
- **Purpose:** Configuration of business logic.
- **Who:** Admin.
- **Components:**
  - **Rule Builder:** (If X then Y).
  - **Threshold Sliders:** (Max wait time, etc.).
  - **Toggles:** (Walk-ins allowed?).
- **Fields:**
  - `MaxPatientsPerDoc` (int).
  - `EmergencyReserveSlots` (int).
- **States:**
  - **Default:** Current active config.
  - **Disabled:** During system maintenance.
  - **Loading:** Validation check.
  - **Error:** 'Invalid Logic Loop'.
  - **Stress State:** Locked to 'Safe Mode' parameters if system unstable.
- **Forbidden Actions:** Setting capacity to 0 without closing hospital.

### 8. PATIENT LIVE STATUS SCREEN (Mobile Web)
- **Purpose:** Anxiety reduction.
- **Who:** Patient (Public URL).
- **Components:**
  - **Position Ring:** (You are #5).
  - **Estimated Time:** ('~14:30 PM').
  - **Location:** ('Room 302').
  - **Delay Notice:** ('Doctor is 15m late').
- **Fields:**
  - `Position` (int).
  - `ETA` (Time).
  - `Message` (String).
- **States:**
  - **Default:** Live countdown.
  - **Disabled:** Appointment cancelled.
  - **Loading:** Spinner.
  - **Error:** 'Status Unknown'. Call reception.
  - **Stress State:** 'High Load - expect delays' banner fixed at top.
- **Forbidden Actions:** N/A.

## SECTION 3 — EVENT SYSTEM (NO SIMPLIFICATION)

### Event Design Principles
- **Schema:** CloudEvents v1.0 compliant.
- **Payload:** Strict JSON.
- **Producer:** Backend Services & IoT Gateways.
- **Consumers:** QueueEngine, NotificationService, AnalyticsDB, AuditLog.
- **Ordering:** Partitioned by `HospitalID` + `DoctorID` (Kafka/Redpanda).
- **Idempotency:** `EventID` (UUID) checked against processed ledger (Redis).
- **Retry:** Exponential backoff (x3), then Dead Letter Queue (DLQ) -> Admin Alert.

### Core Event List (55 Defined)

#### 1. Identity & Registration
- `PATIENT_REGISTERED` (New persistent ID created)
- `PATIENT_PROFILE_UPDATED` (Demographics changed)
- `PATIENT_MERGED` (Duplicate resolution)
- `STAFF_LOGIN`
- `STAFF_LOGOUT`

#### 2. Visit Lifecycle (The 'Golden Path')
- `VISIT_CREATED` (Intent to visit)
- `PATIENT_CHECKED_IN` (Physical arrival)
- `VITALS_RECORDED` (Triage complete)
- `QUEUE_JOINED` (Added to specific doctor list)
- `VISIT_CALLED` (Doctor clicked call)
- `CONSULTATION_STARTED` (Patient entered room)
- `CONSULTATION_EXTENDED` (Time overrun)
- `CONSULTATION_ENDED` (Clinical work done)
- `DISPOSITION_SET` (Outcome defined)
- `BILLING_GENERATED`
- `VISIT_COMPLETED` (Patient left)

#### 3. Queue & Flow Mutation (Chaos)
- `QUEUE_OVERRIDE_APPLIED` (Jump queue)
- `PATIENT_SKIPPED` (No show at door)
- `PATIENT_RETURNED_LATE` (Un-skip)
- `PATIENT_LEFT_QUEUE` (Dropout)
- `QUEUE_PAUSED` (Doctor break)
- `QUEUE_RESUMED`
- `QUEUE_TRANSFER` (Reassign to another doc)
- `SLOT_REALLOCATED`

#### 4. Scheduling & Time
- `APPOINTMENT_BOOKED`
- `APPOINTMENT_CANCELLED_BY_PATIENT`
- `APPOINTMENT_CANCELLED_BY_HOSPITAL`
- `APPOINTMENT_RESCHEDULED`
- `FOLLOWUP_SCHEDULED`
- `FOLLOWUP_MISSED` (System generated)
- `BLOCK_CREATED` (Admin blocks time)

#### 5. Doctor State & exceptions
- `DOCTOR_CHECK_IN` (Arrived at hospital)
- `DOCTOR_DELAY_DECLARED` (I will be late)
- `DOCTOR_DELAY_EXTENDED`
- `DOCTOR_LEFT_PREMISES`
- `DOCTOR_OVERTIME_WARNING`
- `DOCTOR_UNAVAILABLE_EMERGENCY`

#### 6. System & Modes
- `SYSTEM_EMERGENCY_MODE_ON` (Code Red / Casualty surge)
- `SYSTEM_EMERGENCY_MODE_OFF`
- `POWER_OUTAGE_MODE_ACTIVATED`
- `POWER_OUTAGE_MODE_RESOLVED`
- `INTERNET_CONN_LOST`
- `INTERNET_CONN_RESTORED`
- `DATABASE_SYNC_LAG_DETECTED`

#### 7. Notifications & Comms
- `SMS_SENT`
- `SMS_DELIVERY_FAILED`
- `WHATSAPP_SENT`
- `PATIENT_ESCALATION_RISK` (Derived from wait time)

#### 8. Audit & Policy
- `POLICY_VIOLATION_ATTEMPTED`
- `OVERRIDE_APPROVED`
- `ACCESS_DENIED_CRITICAL`
- `DATA_EXPORT_INITIATED`

#### 9. Billing & Inventory (Light touch)
- `PAYMENT_RECEIVED`
- `PAYMENT_FAILED`
- `REFUND_PROCESSED`

### Payload Example: DOCTOR_DELAY_EXTENDED
```json
{
  \"event_id\": \"uuid-1234\",
  \"type\": \"DOCTOR_DELAY_EXTENDED\",
  \"source\": \"/doctor/app\",
  \"timestamp\": \"2023-10-27T09:30:00Z\",
  \"data\": {
    \"doctor_id\": \"doc_55\",
    \"hospital_id\": \"hosp_01\",
    \"original_start\": \"09:00\",
    \"new_start\": \"10:00\",
    \"reason\": \"traffic\",
    \"impact_assessment\": {
      \"delayed_patients\": 12,
      \"total_minutes_lost\": 60
    }
  },
  \"trace_id\": \"trace-abc\"
}
```

## SECTION 4 — QUEUE ENGINE (INTERNAL DESIGN)

### Core Principle: The Phantom Queue
The 'Queue' table does not exist. The Queue is a **projection** of the `Visit` table state, re-calculated on every significant event.

**Why?** Stored queues drift from reality during chaos. Derived queues are eventually consistent.

### Priority Scoring Formula
Every `Visit` in `WAITING` status is assigned a dynamic `PriorityScore`.
The queue is simply: `SELECT * FROM Visits WHERE status='WAITING' ORDER BY PriorityScore DESC, CheckInTime ASC`.

#### Pseudo-Code: Score Calculation
```python
def calculate_priority_score(visit, patient_context, hospital_policy):
    score = 0
    
    # 1. BASELINE (0-100)
    if visit.type == 'EMERGENCY':
        return 9999 # Absolute overrides
    elif visit.type == 'APPOINTMENT':
        score += 50
    elif visit.type == 'WALK_IN':
        score += 30
    elif visit.type == 'FOLLOW_UP':
        score += 40

    # 2. WAIT TIME DECAY (The Fairness Curvature)
    # Patients gain 1 point per 5 minutes of waiting
    minutes_waited = (now() - visit.check_in_time).minutes
    score += (minutes_waited / 5) * 1.5

    # 3. CLINICAL URGENCY (Triage)
    # Triage nurse inputs subjective urgency
    if visit.triage_category == 'RED':
         score += 500
    elif visit.triage_category == 'YELLOW':
         score += 200

    # 4. VIP / OVERRIDE
    if visit.override_flag:
        score += visit.override_weight # Managed by Admin/Receptionist with Audit

    # 5. NO-SHOW GAP FILLING
    # If a booked slot is > 10 mins late, their score drops, allowing walk-ins to jump
    if visit.is_appointment and minutes_late > 10:
        score -= 200 # Penalty box

    return score
```

### Emergency Override Logic
- **Trigger:** Code Red Button.
- **Action:**
  1. Freeze current Consultation timer (assume paused).
  2. Inject Emergency Patient at Index 0.
  3. Push all `WAITING` visits by +1.
  4. Notify all Waiting patients: \"Emergency in progress. Delays expected.\"
  5. **Audit:** This action is irreversible and logged to HQ.

### Multi-Doctor Load Balancing
In a shared OPD (General Medicine), the queue is a pool.
- **Algorithm:** Least-Loaded-Time-Based-Routing.
- **Logic:** Assign to Doctor where `(Count(Waiting) * AvgConsultTime) + CurrentConsultRemaining` is lowest.
- **Hysteresis:** Don't swap patient queues unless difference > 15 mins to avoid confusion.

### Queue Stability Guarantees
- **Anti-Flicker:** Score recalculation happens on events, but the visible board updates are debounced (30s) or smoothed so patients don't see their name jumping up/down erratically.
- **Worst-Case Behavior:** If DB query is slow, System falls back to `First-In-First-Out (FIFO)` based on `CheckInTime` only. This is the 'Safe Mode' queue.

## SECTION 5 — SCHEDULING & RE-EXAMINATION ENGINE

### Future-Aware Slot Discovery
Unlike a calendar, ORBIT schedules based on **Capacity Probability**.

#### Follow-up Windows
- **7 Days (Post-op):** High Priority. Hard Reserve slots (first 30 mins of day).
- **14/30 Days (Routine):** Soft slots.

#### Slot Discovery Algorithm
1. **Fetch Constraints:** Doctor Availability - Blocked Time - Holidays.
2. **Calculate Load:** `Load = (BookedSlots * AvgTime) + (PredictedWalkIns * AvgTime)`.
3. **Congestion Avoidance:** If `Load > 110%` of shift duration, mark day as `OVERFLOW_RISK`. Only Emergencies/Post-ops allowed.
4. **Patient Choice:** Present 'Green' (Low traffic), 'Yellow' (Medium), 'Red' (High traffic) days rather than just times.

### Missed Follow-up Logic
- IF `Visit` (Waiting) -> `NO_SHOW`:
  - Triggers `PATIENT_MISSED_VISIT` event.
  - System checks `MedicalRisk` score.
  - **Low Risk:** Auto-SMS: \"You missed us. Click to reschedule.\"
  - **High Risk:** Create `Ticket` for Call Center: \"Call Patient X immediately.\"

### Re-Exam Priority vs Walk-ins
- **Scenario:** Patient sees doctor, goes for X-ray, comes back same day.
- **Handling:**
  - They do NOT rejoin the tail.
  - They enter a `RE_EXAM` sub-queue.
  - **Policy:** Re-exams are interleaved 1:3 with fresh patients. (1 Re-exam after every 3 fresh consultations).
  - This prevents the "I just need to show a report" crowd from blocking the main flow, while ensuring they aren't ignored.

### Doctor Unavailable Scenarios (The Late Doctor)
- **Input:** `DOCTOR_DELAY_DECLARED` (30 mins late).
- **Action:**
  1. Shift all booked slots +30 mins.
  2. Send SMS: \"Doctor is delayed by 30m. Please arrive at [NewTime].\"
  3. If Delay > 1 hour: Offer `Reschedule` or `Refund`.

## SECTION 6 — DATA MODELS (DATABASE-READY)

### 1. `Visits` (The Truth)
*Single Source of Truth for the patient's journey today.*
- `id` (UUID, PK)
- `hospital_id` (FK, Indexed)
- `patient_id` (FK, Indexed)
- `doctor_id` (FK, Indexed)
- `status` (Enum: BOOKED, ARRIVED, WAITING, IN_CONSULT, COMPLETED, SKIPPED, NO_SHOW)
- `type` (Enum: WALK_IN, APPT, EMERGENCY)
- `priority_score` (Float, Computed, Indexed)
- `check_in_time` (Timestamp)
- `consult_start_time` (Timestamp)
- `consult_end_time` (Timestamp)
- `expected_duration` (Int, minutes)
- `is_re_exam` (Bool)
- `token_display_id` (String: B-102) # See Token Strategy
- `audit_version` (Int)

### 2. `ScheduleBlocks` (Availability)
*Defines when resource is available.*
- `id` (UUID, PK)
- `doctor_id` (FK)
- `start_time` (Timestamp)
- `end_time` (Timestamp)
- `type` (Enum: OPD, OT, ROUNDS, LEAVE)
- `is_soft_block` (Bool) — System can override for emergencies?

### 3. `QueueSnapshots` (Analytical)
*Derived, materialized periodically for analytics (not for live ops).*
- `id` (PK)
- `timestamp`
- `doctor_id`
- `queue_length`
- `avg_wait_time`
- `longest_wait_time`

### 4. `OverrideLogs` (Audit)
*Every time the system rules are broken.*
- `id` (PK)
- `actor_id` (User who did it)
- `visit_id`
- `action` (e.g., JUMP_QUEUE, FORCE_BOOK)
- `reason_code` (FK)
- `reason_text` (Free text)
- `created_at`
- `is_immutable` (Bool: TRUE)

### 5. `EmergencyRecords`
*Details on Code Reds.*
- `id` (PK)
- `visit_id`
- `declared_by`
- `timings_json` (Detailed timeline)
- `outcome`

### 6. `NotificationLogs`
- `id` (PK)
- `visit_id`
- `type` (SMS, WHATSAPP)
- `payload`
- `status` (SENT, DELIVERED, FAILED)
- `consent_proof` (String, SHA256 of consent event)

**Database Choice:** PostgreSQL 15+ (Reliability).
**Indexing Strategy:**
- B-Tree on `Visits(doctor_id, status, priority_score)` for fast queue fetching.
- BRIN index on `AuditLogs(timestamp)` for massive historical tables.

## SECTION 7 — RBAC & PERMISSION SYSTEM

### Role → Permission Matrix (Basic)
| Action | Doctor | Receptionist | Admin | Owner | Autonomous System |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Start/End Consult** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delay Declaration** | ✅ | ⚠️ (Requires Approval) | ✅ | ✅ | ✅ (Heuristic) |
| **Queue Override** | ❌ | ⚠️ (Reason Code) | ✅ | ✅ | ❌ |
| **Emergency Mode** | ✅ | ❌ | ✅ | ✅ | ✅ (High Confidence) |
| **View Revenue** | ❌ | ❌ | ⚠️ (Limited) | ✅ | ❌ |
| **Policy Change** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Delete Visit** | ❌ | ❌ | ❌ | ❌ | ❌ (Soft delete only) |

### [Refined] Auth & Identity Flow
*Designing around shared credentials and undisciplined audits.*
1.  **Device Binding:**
    - First login on a new tablet/device requires OTP to Admin phone.
    - `DeviceID` is cryptographically bound to the session.
    - If credentials are used on a 2nd active device -> "Security Alert: Active Session on Tablet A. Kill?"
2.  **Soft Identity Verification (PIN):**
    - **Doctor:** Log in once in the morning.
    - **Each Action (Rx, Dispose):** Require 4-digit PIN (Quick, but unique).
    - Prevents "Assistant using Doctor's iPad" for critical moves.
3.  **Role Switching:**
    - **Scenario:** Doc enters text on Reception PC.
    - **UX:** "Switch User" (Hot-key). PIN entry Overlay.
    - **Audit:** Action logged as `User: DrSmith invia Device: ReceptionDesk1`.

## SECTION 8 — SYSTEM INTELLIGENCE & LEARNING LOOP

### Signals Collected Continuously
1.  **Pace:** Actual Consult Duration vs Scheduled.
2.  **Arrival:** Patient check-in time vs Appointment time.
3.  **Dropout:** Queue position when patient leaves.
4.  **Volume:** Day-of-week walk-in patterns.

### [New] Doctor Experience Metrics
*Silent tracking of provider health.*
1.  **Burnout Signal:** If `AvgConsultTime` drops by > 20% in last 2 hours + `NotesLength` decreases.
    - **Action:** Alert Admin "Dr. X might be exhausted. Block 15m buffer?"
2.  **Overtime Patterns:** Track `LastPatientOut` vs `ShiftEnd`.
    - **Action:** If consistently > 45 mins late, System suggests shift adjustment (Data-backed conversation).
3.  **Pace Degradation:** Compare 9AM speed vs 2PM speed. Auto-adjust afternoon slots to be wider.

### Rule-Based vs Learned
- **Rule-Based:** \"If waiting > 60 mins -> trigger apology SMS.\" (Deterministic)
- **Learned:** \"Dr. Smith usually takes 12 mins on Mondays, not 15.\" (Adaptive)

### Per-Doctor Pace Modeling (The Learning Core)
System maintains an `Exponential Moving Average (EMA)` for each doctor/procedure pair.
`NewAvg = (CurrentDuration * 0.2) + (OldAvg * 0.8)`
- **Cold Start:** Default to Hospital Standard (e.g., 10 mins).
- **Behavior Drift:** If Dr. Smith speeds up processing, the schedule slots automatically compress over 2 weeks.

## SECTION 9 — AUTONOMOUS SYSTEM ACTIONS

### 1. Auto Slow Arrivals (Throttling)
- **Trigger:** Queue Wait Time > 90 mins.
- **Action:** Stop issuing new Walk-in tokens on kiosk. Show \"Full Capacity\" on website.
- **Confidence:** N/A (Rule based).
- **Reversibility:** Yes, as soon as queue drops.
- **Audit:** \"System throttled intake at 11:00 AM.\"

### 2. Auto Reschedule Low-Priority
- **Trigger:** Doctor delayed > 2 hours.
- **Action:** Query Visits with `Type=ROUTINE_FOLLOWUP`. Send SMS: \"Dr. Late. Reply '1' to move to tomorrow same time.\"
- **Safety:** Do NOT touch 'Post-Op' or 'First Visit'.
- **Confidence:** 100% (Logic based).

### 3. Auto Emergency Mode (Surge Protection)
- **Trigger:** >3 Emergency codes in 10 mins.
- **Action:**
  1. Notify all off-duty doctors.
  2. Cancel all non-checked-in appointments.
  3. Lock Reception screens to 'Triage Only'.
- **Threshold:** High.
- **Reversibility:** Requires Admin PIN.

### 4. Auto Burnout Warning
- **Trigger:** Doctor consult time < 3 mins avg over 20 patients.
- **Action:** Send private alert to Doctor app: \"You are rushing. Take a breaks?\" (Gentle).
- **Privacy:** Logged as generic 'Quality Alert', not shared with Owner immediately vs recurring pattern.

## SECTION 10 — FAILURE & CHAOS SCENARIOS

### 1. Doctor No-Show (The Ghost)
- **Scenario:** Shift starts. Doctor not detected (no phone geofence, no login) for 15m.
- **Response:**
  1. System robot-calls Doctor.
  2. If no answer (+5m): Alert Admin.
  3. If no action (+10m): Auto-SMS waiting patients: \"Doctor delayed. Status update in 15m.\"
  4. Prevents \"Black hole\" waiting room.

### 2. Internet Outage (The Island Mode)
- **Scenario:** ISP failure. Cloud unreachable.
- **Response:**
  1. PWA (Progressive Web App) switches to `OfflineMode`.
  2. Queue run from LocalStorage on Receptionist PC (Master Node).
  3. Doctors sync via local Wi-Fi (LAN) if available, or paper tokens + manual entry later.
  4. **Data:** Read-only history. Write logic queues mutations for sync.

### 3. Power Outage (The Blackout)
- **Scenario:** Ups fails. Generator delay.
- **Response:**
  1. Battery-powered Tablets/Phones become primary.
  2. System switches to Low-Bandwidth Mode (Text only, no images).
  3. Queues converted to SMS lists (System sends Queue to Doctor's SMS inbox as backup list).

### [Refined] State Recovery After Crash
*How to recover when the Master Node dies mid-operation.*
- **Rebuild from Events:** The `Queue` is derived. On restart, System replays `Visits` + `Events` from last snapshot (5 mins ago) + Event Log (Redis/Persistent).
- **Idempotency:** Replaying "Check-in Patient X" 3 times results in 1 Check-in.
- **Procedure:**
    1.  Fetch latest `QueueSnapshot` (Time T).
    2.  Fetch all events `Timestamp > T`.
    3.  Apply reducers.
    4.  Result = Current Realtime State.

## SECTION 11 — OBSERVABILITY & TRUST

### System Health Metrics
- **Heartbeat:** Every 60s from `ReceptionPC` (if missing -> alert Admin 'Hospital Offline').
- **Queue Drift:** `WaitTime_Predicted` vs `WaitTime_Actual` (Alert if delta > 15%).
- **Integration Lag:** HL7 Sync Delay (Target < 2s).

## SECTION 12 — MULTI-TENANCY & PLATFORM FUTURE

### Per-Hospital Isolation
- **Database:** One Database, Schema-per-tenant or `tenant_id` RLS (Row Level Security) on every table.
- **Physical Separation:** Logs and S3 Buckets separated by `org_id`.

## SECTION 13 — NON-FUNCTIONAL REQUIREMENTS

### Latency Budgets
- **Queue Read:** < 50ms (Must feel instant).
- **Search Patient:** < 200ms (Fuzzy search).
- **Complex Schedule Calc:** < 500ms.
- **Offline Sync:** < 30s after reconnection.

### Legal / Audit Readiness
- **Immutable Log:** `OverrideLog` table is APPEND ONLY. No update privileges even for Super Admin.
- **Consent:** "Patient Registered" event includes `ConsentHash` (SHA of "I agree to terms" logic).
- **Data Export:** Button for "Export 7-Year Audit Bundle for Legal".

## SECTION 14 — PHASED DELIVERY PLAN

### PHASE 1: SURVIVAL (Minimum Viable Chaos - 4 Weeks)
- **Goal:** Replace paper/WhatsApp with Digital Queue.
- **Features:**
  - Receptionist Registration (Basic).
  - Doctor \"Next Patient\" Button.
  - Public Waiting View (TV/Mobile).
  - **No Intelligence.** Queues are purely FIFO.
- **Success Metric:** 100% of visits digitized. Zero crashes during Monday morning peak.

### PHASE 2: INTELLIGENCE & OPTIMIZATION (Months 2-4)
- **Goal:** Predictability.
- **Features:**
  - Scheduling & Appointments.
  - Wait Time Prediction (AI V1).
  - Doctor Delays & Comms.
  - Emergency/Override logic.
- **Success Metric:** Wait time accuracy +/- 10 mins.

### PHASE 3: PLATFORM & ECOSYSTEM (Months 5+)
- **Goal:** Expansion.
- **Features:**
  - Multi-location/Chain support.
  - Plugin API.
  - Re-examination loops.
  - Full autonomous actions.
- **Success Metric:** 50+ Hospitals live.

---
## SECTION 15 — CONFIG vs POLICY vs AUTONOMY

*Strict separation of powers to prevent chaos.*

| Layer | Who Controls? | Definition | Examples |
| :--- | :---: | :--- | :--- |
| **1. CONFIG** | Hospital Admin | Preference settings that affect convenience, not safety. | Opening hours, Doctor room number, Ticket print format, default language. |
| **2. POLICY** | Admin (Guarded) | Business rules. Changing these requires a confirmation flow + Audit reason. | "Allow Walk-ins?", "Max Overbooking %", "VIP Quota". |
| **3. AUTONOMY** | SYSTEM (Hardcoded) | **Safety Systems.** Admins CANNOT disable these via UI. Requires Engineering intervention. | Emergency Override Logic, Queue Fairness Algorithm, Anti-Corruption (Audit logging), Backup Mode. |

*Why?* A hospital manager might try to "Disable Emergency Mode" to hide stats. The System forbids this.

## SECTION 16 — EXPLAINABILITY SURFACE (TRUST UI)

*AI decisions must be transparent to build trust.*

### 1. The "Why?" Accordion
- **Context:** Whenever a patient jumps the queue (System decision) or a slot is blocked.
- **UI:** A small `?` icon next to the action.
- **Expansion:** "Patient X moved up because: `Emergency Triage (Code Red)` detected at 10:42 AM."
- **Confidence Score:** "Predicted Wait: 45m (Confidence: High - based on similar Mondays)."

### 2. Natural Language Audit
- Instead of raw logs, show: "System auto-rescheduled 5 patients because Dr. Smith is 2 hours late."
- Make autonomy visible, not magic.

## SECTION 17 — DATA FLYWHEEL & MOAT

### 1. What Improves Over Time (The Flywheel)
- **Pace Accuracy:** Tighter scheduling slots (15m -> 12m) = 20% more revenue/day without burnout.
- **No-Show Prediction:** Dynamic overbooking (double book the flakers) = 15% utilization boost.

### 2. Isolation Strategy
- **Per-Hospital Learning:** Dr. Smith's pace at Hospital A is learned separately from Hospital B (different context).
- **Global Heuristics:** "Mondays are 20% heavier" is a global signal pushed to all new tenants as a baseline (Cold Start aid).

### 3. Model Rollback
- If a new learning model increases Wait Times by > 10%, System auto-reverts to "Previous Good Model" and flags Data Science team.

## SECTION 18 — OPERATIONAL PLAYBOOK (NON-TECH)

*The manual for the humans.*

### Day 0 (Go Live - The Chaos Day)
- **Expect:** 10% lower throughput. Confusion.
- **Focus:** Just register correctly. Ignore scheduling.
- **Don't Expect:** Accurate wait time predictions (System is learning).

### Day 7 (First Adjustment)
- **Expect:** Staff comfortable with iPads.
- **Action:** Review "Override Logs". Is reception abusing VIP mode? Coach them.

### Day 30 (Efficiency)
- **Expect:** Predictions stabilize.
- **Action:** Enable "Auto-Overbooking" for habitual no-shows.

## SECTION 19 — MONETIZATION-INSTRUMENTATION

*ROI Dashboards to prevent Churn.*

### 1. The "Value Saved" Widget
- **Metric:** "Patient Conflicts Avoided".
- **Metric:** "Revenue Retained" (from Auto-rescheduled patients who didn't drop out).

### 2. Token / Visit ID Strategy
- **Format:** `[HospID]-[Date]-[Seq]` (e.g., `APO-2610-042`).
- **Seq Reset:** Daily.
- **Expiry:** Tokens invalid at 23:59 local time.
- **Re-exams:** Do NOT get a new ID. They get a `Version Suffix` (e.g., `APO-2610-042-R1`) to link clinical history.

**END OF DESIGN DOCUMENT**
