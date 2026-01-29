# ORBIT — Doctor Dashboard Clinical UX Design

## SECTION 1 — DOCTOR DASHBOARD GOALS

**Top 5 Goals:**
1.  **Cognitive Preservation:** Minimize mental load so 100% of attention is on the patient.
2.  **Flow Momentum:** Reduce friction between "Call", "Consult", and "Complete" to zero.
3.  **Clinical Velocity:** Enable faster-than-paper documentation of key clinical facts.
4.  **Operational Harmony:** communicate status to reception without verbal argument.
5.  **Trust:** The system must never crash, lag, or confuse the doctor during a consult.

**Top 5 Failures:**
1.  **Data Overload:** Seeing full queues creates subconscious anxiety/rush.
2.  **Navigation Fatigue:** Having to click "Back" or "Menu" breaks flow.
3.  **Typos/Input Friction:** Struggling with text fields leads to abandonment (going back to paper).
4.  **Alert Fatigue:** Unnecessary popups or metrics (e.g., "You are 5 mins late") cause resentment.
5.  **Rigidity:** Forcing a specific workflow step order when clinical reality is non-linear.

**Solution Strategy:**
*   This dashboard removes all navigation. It is a single-screen state machine.
*   It hides the queue entirely, showing only "Next".
*   It uses large, touch-friendly targets for main actions.
*   It defaults to "Free Text" for speed but offers "Structured" for power users.

## SECTION 2 — SCREEN STRUCTURE

**Always Visible:**
*   Current Patient Identity (Name, Age, Gender).
*   Clinical Canvas (Diagnosis/Rx).
*   Primary Action Button (floating/sticky at bottom right or clear center).
*   Elapsed Timer (subtle).

**Never Requires Scrolling:**
*   The Primary Action Button.
*   The "Emergency / Break" controls.

**Hidden by Default:**
*   The Full Queue.
*   Past Medical History (unless requested/relevant).
*   Admin/Billing details.

**Focus Maintenance:**
*   All inputs should ideally be on one screen.
*   "Up Next" is a tiny strip, not a list, to prevent "looking ahead" anxiety.

## SECTION 3 — CURRENT PATIENT CARD (CORE)

**Visible Fields:**
*   **Token ID (Large):** For verification.
*   **Name (Large):** For rapport.
*   **Age/Gender (Medium):** Clinical context (e.g., dose calculation).
*   **Visit Reason (Highlighted):** The anchor for the consult.

**Editable Clinical Info:**
*   Diagnosis (The "Verdict").
*   Prescription (The "Action").
*   Follow-up Date (The "Plan").

**Read-Only:**
*   Patient Demographics (edited at reception).
*   Past History (for now).

**Forbidden:**
*   Insurance/Payment status (Billers handle this).
*   Full address/phone (irrelevant during consult).

## SECTION 4 — CONSULTATION FLOW STATES

1.  **Idle:**
    *   View: Empty State / "Ready for Patient".
    *   Action: "Call Next Patient" (prominent).
    *   Events: `DOCTOR_IDLE`.

2.  **Patient Called (Transition):**
    *   View: "Calling [Name]...".
    *   Action: "Start Consult" (once patient arrives).
    *   Events: `CALL_PATIENT`.

3.  **In Consultation:**
    *   View: Patient Card + Clinical Canvas.
    *   Actions: Input Diagnosis/Rx, "Complete Visit".
    *   Events: `CONSULT_STARTED`.

4.  **Completing Visit:**
    *   View: Summary / Confirmation / Follow-up selection.
    *   Action: "Confirm & Call Next".
    *   Events: `VISIT_COMPLETED`.

## SECTION 5 — TIME & FLOW AWARENESS

*   **Elapsed Timer:** A simple `MM:SS` counter starting from "Start Consult".
    *   *Green* < 10 mins.
    *   *Amber* > 10 mins.
    *   *No Red* (to avoid stress).
*   **Self-Regulation:** Doctors naturally adjust pace seeing the timer, without flashing alerts.
*   **Never Shown:** "You are behind schedule by X mins" (Demotivating).

## SECTION 6 — “UP NEXT” PREVIEW

*   **Design:** A small footer bar: "Up Next: [Name] (Reason)".
*   **Purpose:** Allows mental context switching (e.g., "Okay, next is a fevery baby, I need to wash hands").
*   **Why Minimal:** Preventing the "Conveyor Belt" feeling.

## SECTION 7 — DIAGNOSIS & CLINICAL NOTES

*   **Input:** Multi-line Text Area with "Smart Suggestions" (future).
*   **Default:** Free text. Speed > Structure.
*   **Safety:** No validation blocking. If doc writes "Viral fever", accept it. Don't force ICD-10 codes in Phase 1.

## SECTION 8 — PRESCRIPTION SYSTEM (STRUCTURED)

*   **Structure (Table Row):**
    *   **Medicine Name:** Typeahead search.
    *   **Dosage Pattern:** Chips [1] [½] [0] for Morning/Afternoon/Night.
    *   **Timing:** Select [Before Food] [After Food].
    *   **Duration:** Number + [Days/Weeks].
    *   **Quantity:** Auto-calc (suggested) but editable.
*   **Interaction:**
    *   "Add Medicine" button (clean row).
    *   Enter -> New Row.
    *   Trash icon to delete.
*   **Balance:** 100% structured (for pharmacy/legal safety).
*   **Mistakes:** Easy "X" to remove line item. Clear visual separation.

## SECTION 9 — FOLLOW-UP / RE-EXAMINATION FLOW

*   **UI:** Row of buttons:
    *   `[None]` `[3 Days]` `[7 Days]` `[1 Month]` `[SOS]`
*   **Logic:**
    *   Clicks -> Updates `visit.followUpDate`.
    *   Reception sees this flag on their dashboard checkout list.
*   **Forbidden:** Doctor telling patient "Come back whenever". System must track it.

## SECTION 10 — DOCTOR BREAKS & DELAYS

*   **Controls:** Small secondary buttons.
    *   `[☕ Short Break]` -> Pauses queue, reception sees "On Break".
    *   `[⚠️ Running Late]` -> Broadcasts updated wait times to queue.
*   **Notification:** Reception dashboard updates status pill. No phone call needed.

## SECTION 11 — COMPLETE VISIT ACTION

*   **Preconditions:** Diagnosis entered (Check). Rx optional.
*   **Post-Click:**
    1.  Save Data.
    2.  Show "Success/Saved" toast.
    3.  Reset view to "Idle" OR Auto-load "Up Next" (Preference config).
*   **Flow:** "Complete & Call Next" is the power user button.

## SECTION 12 — WHAT DOCTORS MUST NEVER SEE

*   **Admin/Billing:** "Patient owes $50".
*   **Queue Complaints:** "Patient waiting for 45 mins" (Reception's problem).
*   **System Errors:** "Database connection lost" (Fail gracefully/locally).

## SECTION 13 — EVENTS EMITTED

1.  `CALL_PATIENT`: Triggers TV screen/Speaker.
2.  `CONSULT_STARTED`: timestamp start.
3.  `CONSULT_COMPLETED`: timestamp end, saves clinical data.
4.  `FOLLOWUP_SET`: writes to patient record.
5.  `STATUS_CHANGE`: (Break/Resume).

## SECTION 14 — PHASED UPGRADE PATH

*   **Phase 1 (MVP - Chaos Safe):**
    *   Single Patient Focus.
    *   Free Text Inputs.
    *   Manual "Call".
    *   One-tap Follow-ups.
*   **Phase 2 (Assistive):**
    *   Rx Autocomplete.
    *   Voice-to-Text Diagnosis.
*   **Phase 3 (Productivity):**
    *   AI Summary of past visits.
    *   Auto-generated discharge papers.
