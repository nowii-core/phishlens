# nowii·lens — PhishLens

### Threat Intelligence · Web · Cybersecurity

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

##  Overview

**PhishLens** is a client-side threat intelligence engine designed to detect phishing, typosquatting, and spoofing attempts. 

The application is built with a strong focus on privacy and performance. It runs entirely in the browser, ensuring that no data ever leaves the user's device. There are no external API calls, no tracking, and no dependencies.

It combines heuristic analysis with a modern SOC (Security Operations Center) dashboard to provide immediate and actionable threat reports.

> Analyze. Detect. Protect.

##  Features

- **URL Analyzer** — Detects typosquatting (Levenshtein distance), IP hosts, punycode domains, suspicious TLDs, URL shorteners, and executable extensions.
- **Text Payload Analyzer** — Scans emails and SMS for urgency keywords, credential requests, IBANs, credit cards, and crypto wallets. Recursively analyzes embedded links.
- **Email Header Analyzer** — Validates SPF, DKIM, DMARC, detects From/Reply-To mismatches, and identifies Display Name spoofing.
- **Enterprise Dashboard** — Features a sleek dark/light theme, skeleton loading states, and a local scan history.
- **Raw JSON Export** — View and download detailed reports in JSON format for SIEM integration.
- **PWA Ready** — Installable as a desktop/mobile app and fully functional offline via Service Workers.
- **Anti-Crash Protection** — Payload size limits prevent browser freezing on massive inputs.

##  Scoring System

Each detected risk indicator has a specific weight and severity. The sum of the weights generates a score from 0 to 100:

| Score | Classification | Recommended Action |
| :--- | :--- | :--- |
| **80 - 100** |  `CRITICAL` | Confirmed threat. Do not interact. |
| **60 - 79** |  `HIGH` | Highly suspicious. Verify the sender. |
| **40 - 59** |  `MEDIUM` | Anomalous signals. Proceed with caution. |
| **20 - 39** |  `LOW` | Low risk, but monitor. |
| **0 - 19** |  `SAFE` | No strong indicators detected. |

##  Tech Stack

- **HTML5** (Semantic structure)
- **CSS3** (Grid, Flexbox, Custom Properties, Skeleton Loading)
- **Vanilla JavaScript** (ES6+ Modules, Service Workers, LocalStorage, Clipboard API)

##  Quick Start

No build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/nowii-core/phishlens.git
