# Home Plumbing Care – Leak & Maintenance Planner

> **Free home plumbing maintenance planner and leak tracker with checklists, reminders, and repair history.**

**Home Plumbing Care** is a free home plumbing maintenance planner that helps homeowners organize routine checks, document plumbing issues, and track repair history. Built with vanilla web standards (HTML5, CSS3, JavaScript) and utilizing browser `LocalStorage`, it provides a zero-setup, privacy-friendly solution to prevent catastrophic water damage and manage residential plumbing health.

For homeowners in South Texas seeking professional inspection, repair, or emergency plumbing services, visit [The Plumbing Brownsville](https://www.theplumbingbrownsville.com/) for local assistance and services.

---

## 🛠️ Key Features

### 1. Plumbing Maintenance Dashboard
* **Real-Time Health Status:** Instant visual overview of routine inspection scores, active plumbing issues, upcoming seasonal maintenance reminders, and total repair records.
* **Urgent Attention Alerts:** Automatic detection of high-risk active leaks and overdue maintenance tasks.
* **Quick-Check Interaction:** Check off routine inspection items directly from the dashboard view.

### 2. Routine Plumbing Maintenance Checklist
* **Pre-Loaded Standard Inspection Points:**
  * Inspect faucets for leaks (bathrooms, kitchen, laundry).
  * Check visible pipes for moisture and condensation.
  * Inspect under kitchen and bathroom sink vanities.
  * Check toilet flushing efficiency and visible tank leaks.
  * Inspect water heater exterior for corrosion or pooling water.
  * Check drains for slow drainage and trap health.
  * Inspect outdoor hose connections and bibbs.
* **Custom Checklist Items:** Add, edit, and delete homeowner-specific checks.
* **Log Inspection to History:** One-click logging creates a permanent timestamped record of completed inspections in your logbook.

### 3. Leak & Plumbing Issue Tracker
* **Comprehensive Issue Logging:** Record title, category (faucet drip, pipe sweat, running toilet, slow drain, water heater, low pressure, etc.), room/location, detection date, notes, and severity (Low, Medium, High, Emergency).
* **Workflow Status Management:** Mark issues as `Pending`, `In Progress`, or `Resolved`.
* **Automated Logbook Transition:** Resolving an issue automatically logs the completed fix into the permanent Repair History.
* **Search & Multi-Filter:** Instantly filter issues by severity, status, or keyword.

### 4. Maintenance Reminder Planner
* **Seasonal & Preventive Scheduling:** Plan recurring or one-time maintenance (e.g. annual water heater sediment flushing, washing machine hose inspections, winter pipe insulation).
* **Automatic Status Tracking:** Calculates due dates dynamically to flag `Overdue`, `Due Today`, or `Upcoming` reminders.
* **Completion Logging:** Checking off a reminder creates an automatic record in the maintenance history.

### 5. Repair History & Printable Home Report
* **Permanent Home Logbook:** Maintains a complete timeline of past repairs, contractor visits, and completed inspections.
* **Printable Report:** Dedicated clean `@media print` layout engineered for paper logs, home sales disclosure documentation, or home insurance filing.
* **Zero Backend Data Backup:** Export your entire record database as a portable JSON file or restore from a previous backup in one click.

### 6. Homeowner Educational Guides & Resources
* Non-hazardous preventative advice covering:
  * How to locate and operate the main water shut-off valve.
  * Spotting silent hidden leaks using your utility water meter.
  * Safe mechanical drain maintenance (avoiding caustic pipe-damaging chemicals).
  * Annual water heater maintenance basics.
  * Outdoor spigot freeze protection.
* Critical signs when to stop DIY inspection and call a licensed plumber.

---

## 💻 Technologies Used

* **HTML5:** Semantic, accessible layout with ARIA attributes and Open Graph metadata.
* **CSS3:** Custom properties (design tokens), mobile-first responsive grid/flexbox layouts, smooth CSS transitions, and dedicated print stylesheet (`@media print`).
* **Vanilla JavaScript (ES6+):** Pure browser execution with zero npm dependencies, zero build steps, and zero external framework lock-in.
* **LocalStorage API:** All user data is stored safely in your own web browser with complete client-side data sovereignty.
* **Inline SVG Vector Assets:** Crisp icons and responsive graphics with zero external font dependencies.

---

## 🚀 Installation & Local Running Instructions

Because Home Plumbing Care is built strictly with client-side web technologies, there are **no package managers, servers, or build commands required**.

### Running Locally:
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shoaibzahoor5253-beep/home-plumbing-care.git
   cd home-plumbing-care
   ```
2. **Open in your web browser:**
   * Double-click `index.html` in your file explorer, or open it directly in Chrome, Firefox, Safari, Edge, or Brave:
   ```bash
   # On Windows PowerShell
   start index.html
   ```
3. **Optional (Local HTTP Server):**
   If you prefer running through a local web server:
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000` in your browser.

---

## 📖 How to Use the Application

1. **Perform a Visual Check:** Navigate to the **Checklist** tab and inspect your fixtures. Check off items as you verify them. Once finished, click **"Log Today's Inspection to History"** to document your review.
2. **Track a Leak or Issue:** If you spot an issue (like a running toilet or dripping sink), click **"Log Issue"** or switch to the **Leak & Issue Tracker** tab. Fill in the location, severity, and notes.
3. **Schedule Preventive Work:** Switch to the **Reminders** tab and add upcoming seasonal tasks (e.g. winterizing outdoor bibbs in October).
4. **Print or Export History:** Go to **Repair History** and select **"Printable Report"** to print or save a PDF summary of your home's plumbing maintenance records.
5. **Backup Your Records:** Use the **Data** button in the top navigation bar to download a JSON file of your records for safe keeping.

---

## 📸 Screenshots

*(Visual layout placeholders)*

```
+--------------------------------------------------------------------------+
|  HOME PLUMBING CARE             [+ Log Issue]  [Print Report]  [Data]    |
|  [Dashboard]  [Checklist (0/7)]  [Issues (2)]  [Reminders (1)]  [History]|
+--------------------------------------------------------------------------+
|  HOME PLUMBING OVERVIEW                                                  |
|  Monitor routine checks, track active water leaks & stay ahead.          |
|                                                                          |
|  +------------------+  +------------------+  +-------------------------+ |
|  | ROUTINE CHECKLIST|  | ACTIVE ISSUES    |  | UPCOMING REMINDERS      | |
|  |     71% Done     |  |   2 Tracked      |  |     1 Scheduled         | |
|  +------------------+  +------------------+  +-------------------------+ |
|                                                                          |
|  PRIORITY ATTENTION ITEMS             QUICK INSPECTION CHECKLIST         |
|  * [HIGH] Powder room faucet drip     [x] Inspect faucets for leaks      |
|  * Overdue: Water heater tank flush   [ ] Check visible pipes for sweat  |
+--------------------------------------------------------------------------+
```

---

## ⚠️ Safety Disclaimer

> **IMPORTANT:** Home Plumbing Care is designed strictly for organizational tracking, visual home inspection checklists, and maintenance log keeping.
>
> **Do not attempt DIY repairs on:**
> * Natural gas or propane fuel supply lines.
> * High-voltage electrical water heater elements or wiring.
> * Main municipal pressurized water supply connections.
> * Main sewer stacks or collapsed drainage lines under structural slabs.
>
> If you experience severe water leaks, flooding, sudden loss of water pressure, or sewage odor, immediately turn off your main water shut-off valve and contact a licensed, insured plumbing professional. This tool never replaces professional diagnostic inspection.

---

## 🌐 Professional Resources & Community Link

Need professional plumbing assistance in Brownsville? Visit [The Plumbing Brownsville](https://www.theplumbingbrownsville.com/) for plumbing services, emergency assistance, and local service information.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) &mdash; free for homeowners, property managers, and open-source contributors.

