# StockWise ERP

**[🔴 LIVE DEMO: Click here to view the App](https://stock-wise-eight.vercel.app)**

A full-stack, AI-powered Inventory Management System designed for small businesses. Built with **Next.js 15**, **PostgreSQL**, and **Google Gemini**.

![Project Status](https://img.shields.io/badge/Status-Live_Beta-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_Prisma_|_Postgres-blue)

## Live Link

## Key Features

* **Transactional Inventory:** Implements **ACID-compliant transactions** for stock movements (In/Out/Adjustments) to ensure strict financial accuracy.
* **Sales Orders:** Batch processing of multi-item sales with automatic stock deduction and revenue calculation.
* **AI Business Intelligence:** Integrated **Google Gemini 2.5 Flash** to analyze stock levels and generate executive summaries and risk assessments.
* **Real-time Dashboard:** Server-side rendered analytics for zero-latency KPI tracking.

## Tech Stack

* **Framework:** Next.js 15 (App Router, Server Actions)
* **Language:** TypeScript (Strict)
* **Database:** PostgreSQL (via Vercel/Neon)
* **ORM:** Prisma
* **UI:** Tailwind CSS + Shadcn/ui
* **AI:** Google Generative AI SDK

## Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/talalam23/stock-wise.git
    cd stockwise
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file in the root:
    ```env
    DATABASE_URL="postgresql://..."
    GEMINI_API_KEY="AIzaSy..."
    ```

4.  **Sync Database**
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
