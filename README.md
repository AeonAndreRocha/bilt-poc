# BILT PoC — 3D Assembly Instruction Viewer

A browser-based step-by-step 3D assembly guide (inspired by [BILT](https://biltapp.com/)), built with **Babylon.js**, **React 19**, and **Vite**.

Currently includes two products:

- **IKEA KALLAX 2×2** — 13-step shelf assembly with wooden dowels
- **JYSK LUNDTOFT** — 9-step adjustable side table assembly with screws

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes npm)

## Setup

```bash
git clone <repo-url>
cd bilt-poc
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Use the **sidebar** to switch between assembly guides and click **Next →** to step through each assembly.

## Build for production

```bash
npm run build
npm run preview
```
