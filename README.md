# PhishLens

<p align="center">
  <b>Client-Side Threat Intelligence Engine Designed for Detecting Phishing, Typosquatting, and Spoofing with an Absolute Focus on Privacy and Performance</b>
</p>

<p align="center">
  <a href="https://github.com/nowii-core/phishlens/actions/workflows/ci.yml">
    <img src="https://img.shields.io/badge/CI-Passing-2ea44f?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI Status">
  </a>
  <a href="https://github.com/nowii-core/phishlens/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-007ec6?style=for-the-badge" alt="License">
  </a>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-scoring-system">Scoring System</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-contact">Contact</a>
</p>

---

</div>

## Overview

**PhishLens** executes its entire analysis directly within the browser, guaranteeing that no data ever leaves the user's device. The system makes no external API calls, includes no tracking, and maintains zero external dependencies. It combines heuristic analysis with a modern SOC (Security Operations Center) style dashboard to provide immediate, actionable risk reports.

---

## Preview

![PhishLens Screenshot](Screenshot-1.png)

---

## Key Features

- **URL Analyzer:** Detection of typosquatting (Levenshtein distance), IP hosts, punycode domains, suspicious TLDs, URL shorteners, and executable extensions.
- **Text Payload Analyzer:** Scanning of emails and SMS for urgency keywords, credential requests, IBANs, credit cards, and crypto wallets, including recursive analysis of embedded links.
- **Email Header Analyzer:** Validation of SPF, DKIM, DMARC, identification of From/Reply-To misalignments, and detection of Display Name spoofing.
- **Enterprise Dashboard:** Graphical interface with dark/light theme support, skeleton loading states, and local scan history.
- **Raw JSON Export:** Visualization and export of detailed reports in JSON format for integration with SIEM systems.
- **PWA Ready:** Installable as a desktop/mobile application and fully usable offline via Service Workers.
- **Anti-Crash Protection:** Payload size limits to prevent browser freezes on massive inputs.

---

## Scoring System

Each risk indicator has a specific weight and severity. The sum of the weights generates an overall score from 0 to 100:

| Score | Classification | Recommended Action |
| :--- | :--- | :--- |
| **80 - 100** | `CRITICAL` | Confirmed threat. Do not interact. |
| **60 - 79** | `HIGH` | Highly suspicious. Verify the sender. |
| **40 - 59** | `MEDIUM` | Anomalous signals. Proceed with caution. |
| **20 - 39** | `LOW` | Low risk, but monitor closely. |
| **0 - 19** | `SAFE` | No critical indicators detected. |

---

## Tech Stack

### Frontend
- **HTML5:** Semantic structure.
- **CSS3:** Grid, Flexbox, Custom Properties, Skeleton Loading.
- **JavaScript:** Native ES6+ Modules, Service Workers, LocalStorage, Clipboard API.

---

## Project Architecture

```
phishlens/
├── .github/                 # Issue/PR templates and CI/CD workflows
├── assets/                  # Icons, graphics, and static resources
├── css/                     # Modular stylesheets (themes, layout)
├── js/                      # Core analysis modules and UI logic
├── index.html               # Main application page
├── manifest.json            # PWA configuration
├── service-worker.js        # Offline caching and PWA support
└── README.md                # Project documentation
```

---

## Quick Start

### Prerequisites
No build step is required. The application runs entirely in the browser.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nowii-core/phishlens.git
   cd phishlens
   ```

2. **Run the application:**
   Simply open the `index.html` file in your preferred modern web browser. For optimal PWA and Service Worker functionality during development, it is recommended to serve the directory using a local HTTP server (e.g., `npx serve`, Python's `http.server`, or VS Code Live Server).

---

## Contact & Support

- **Maintainer:** [@nowii-core](https://github.com/nowii-core)
- **Bug Reports & Feature Requests:** If you encounter an issue or would like to suggest an improvement, open an [Issue](https://github.com/nowii-core/phishlens/issues) or submit a [Pull Request](https://github.com/nowii-core/phishlens/pulls).

---

<div align="center">
  <sub>Developed by <b>nowii-core</b></sub>
</div>
