# Orbit Hospital OS 🏥
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://orbit-h2m5.vercel.app/)


ORBIT is an open-source, event-driven Hospital Operations Platform built for India’s busiest OPDs and IPDs — where queues break, staff burn out, and patients lose visibility. Unlike traditional HMS systems, ORBIT is designed around real-time flow orchestration, not static records.

**Think: Kubernetes for hospital operations.**

![Orbit Dashboard](https://via.placeholder.com/800x400?text=Orbit+Dashboard+Preview)(https://orbit-h2m5.vercel.app/)

## � Why ORBIT Exists
Hospitals don’t fail because of lack of doctors. They fail because of unmanaged flow.

**Common problems ORBIT solves:**
- 2–6 hour unpredictable OPD waits
- Doctor overload and uneven queues
- Zero visibility for patients
- Chaotic IPD admissions and bed allocation
- Manual prescriptions, billing gaps, and follow-up misses
- No real-time operational intelligence

ORBIT treats a hospital as a **living system**, not a database.

## 🧠 Core Philosophy
- **Flow-first**, not form-first
- **Event-driven**, not request-driven
- **Role-native dashboards**, not one-size-fits-all
- **Real-time truth**, not end-of-day reports
- **Chaos-aware design**, not ideal assumptions

## 🏗️ What ORBIT Is (and Is Not)

| ✅ ORBIT IS | ❌ ORBIT IS NOT |
| :--- | :--- |
| A modular hospital operating system | A traditional HMS / EMR clone |
| Built for OPD + IPD + Pharmacy + Billing + Ops | An appointment booking app |
| Designed for real-time queues and admissions | A patient discovery platform |
| Open for contributors and extension | “Yet another admin panel” |

## 🧩 Core Dashboards (Current)

### 1️⃣ Reception Desk
Fast-track patient registration and queue orchestration.
- Walk-in registration & Token generation
- Doctor availability strip
- Emergency overrides & Queue visibility

### 2️⃣ Doctor Console
Focus on care, not chaos.
- Live patient queue
- Diagnosis & structured prescriptions (Auto-generated PDF)
- Follow-up scheduling
- OPD → IPD admission trigger

### 3️⃣ IPD / Ward Operations
Real-time bed & ward management.
- Ward / ICU / Private room layout
- Bed availability, occupancy & allocation
- Gender / category constraints
- Audit trail (admission → discharge)

### 4️⃣ Pharmacy
Prescription fulfillment & billing.
- Live prescription queue
- Dispense tracking & Revenue visibility
- OPD + IPD medicine linkage

### 5️⃣ Billing & Accounts
Centralized financial control.
- Consolidated patient billing (OPD + IPD + Pharmacy)
- Search by patient / ID & Payment status tracking

### 6️⃣ Operations Command (War Room)
Hospital-wide intelligence layer.
- OPD throughput & Doctor load
- Bed occupancy & Revenue signals
- Chaos index (experimental)

### 7️⃣ Super Admin
Network-level control.
- Multi-clinic / hospital setup
- Pricing configuration & Bed categories
- Roles & permissions

## 🔄 Admission Flow (OPD → IPD)
1. Doctor flags “Require Admission”
2. System checks bed availability
3. Suggested bed types (General / Private / ICU) show up
4. Patient selects bed based on price & availability
5. Bed auto-allocated
6. Confirmation sent to patient + ward + reception

**No paper. No confusion. Full traceability.**

## 🧱 Architecture (High-Level)
- **Frontend**: Modular role-based UI (Next.js 14, Tailwind)
- **Backend**: Event-driven services (Next.js App Router API)
- **State**: Real-time queue & bed state (Zustand + LocalStorage/DB)
- **Notifications**: SMS / WhatsApp hooks
- **Storage**: Structured + audit logs

## 📌 Project Status
**Current Maturity:**
- 🟢 OPD Queue Engine: v0.8
- 🟡 Doctor Console: v0.7
- 🟡 IPD Operations: v0.6
- 🟡 Pharmacy: v0.5
- 🟠 Billing: v0.4
- 🔴 AI Prediction Engine: Planned

## 🛠️ Why Open Source Now?
Because hospital workflows vary massively, real-world edge cases matter, and we want ORBIT shaped by builders, not assumptions. This is **builder-first open source**, not polished marketing code.

## 🤝 How You Can Contribute
We actively welcome contributions in:
- UI/UX improvements
- Prescription engine
- Bed allocation logic
- Billing workflows
- Performance optimization
- Documentation & AI models (future)

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 🚀 Long-Term Vision
- The default OS for Indian hospitals
- A real-time operational layer
- A research & optimization platform
- A foundation for healthcare AI

## ⚠️ Disclaimer
ORBIT is not a certified medical device. Clinical responsibility always lies with licensed professionals.

---

## 📦 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/fairworkoffical-lab/Orbit.git
    cd Orbit
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Visit [http://localhost:3000](http://localhost:3000) to see your **local instance**.
    *(For the public live demo, view [orbit-h2m5.vercel.app](https://orbit-h2m5.vercel.app/))*

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**ORBIT is not finished. But it is real. And it is being built in the open.**
