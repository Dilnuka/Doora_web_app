# Doora Web App - Project Information

## 1. Project Overview
**Doora** is a Next.js web application designed as a Smart Home Control Panel or property management system. It provides real-time control, monitoring, and visualization for different rooms and devices. The application features a robust role-based system (Admin vs. Guest), real-time device communication via MQTT, and interactive UI elements for a modern user experience.

## 2. Technology Stack
*   **Framework:** Next.js (v16.2.6) - App Router (`app/` directory architecture)
*   **UI Library:** React (v19.2.4)
*   **Database ORM:** Prisma (v7.8.0)
*   **Database Engine:** PostgreSQL (`pg` library, with `@prisma/adapter-pg`)
*   **Authentication:** Next-Auth (v5.0.0-beta.31)
*   **Styling:** Vanilla CSS (`globals.css`, CSS Modules like `page.module.css`)
*   **Animations & Visuals:** Framer Motion, `@tsparticles/react`, `@tsparticles/slim`
*   **Icons:** Lucide React
*   **Real-time Communication:** MQTT (`mqtt` package)
*   **AI/LLM Integration:** Groq SDK (`groq-sdk`)

## 3. Database Schema (Prisma)
The database models a multi-tenant or multi-room system with the following core entities:
*   **User:** Contains user credentials, role (`ADMIN` or `GUEST`), and an optional association to a specific `Room`.
*   **Room:** Represents a physical space or unit. It has a unique `code`, a `name`, and a JSON `state` field to store the current status of devices within that room.
*   **Account / Session / VerificationToken:** Standard models required by Next-Auth for handling OAuth and session management.

## 4. Project Structure
### Core Directories
*   **`/app`**: Contains the Next.js App Router pages and API routes.
    *   `/admin`: Dashboard and controls specific to Admin users.
    *   `/api`: Backend API endpoints (likely handling DB updates, MQTT bridging, Next-Auth).
    *   `/controller`: Interface for controlling smart devices.
    *   `/login` & `/signup`: Authentication pages.
    *   `/visualization`: Visual dashboard or maps of the rooms/property.
*   **`/components`**: Reusable React components.
    *   `AdminGroundMap.jsx`: Visual representation of the property for admins.
    *   `GuestApp.jsx`: The main interface presented to guest users.
    *   `RoomDashboard.jsx`: Detailed control panel for a specific room.
    *   `SystemLogs.jsx`: Component to display real-time system logs or events.
    *   `ParticleNetwork.jsx` & `SplashScreen.jsx`: UI and animation components.
*   **`/prisma`**: Database configuration (`schema.prisma`) and seed scripts.
*   **`/public`**: Static assets, including smart home imagery.

## 5. Key Features & Workflows
*   **Role-Based Access Control:** Differentiates between Admins (full control, map views) and Guests (limited to their assigned room).
*   **Real-Time State:** Utilizes MQTT for potentially instant updates from physical hardware devices to the web dashboard and vice versa.
*   **Interactive Visualizations:** Components like `AdminGroundMap` suggest a spatial interface to monitor the entire system at a glance.

## 6. Scripts & Commands
*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Generates the Prisma client and builds the Next.js production bundle.
*   `npm start`: Runs the built Next.js application.
*   `npm run lint`: Runs ESLint for code quality checks.
*   *Prisma Seeding:* Configured to run `node prisma/seed.js` to populate the database with initial data.

## 7. Project Scope & Future Roadmap
The scope of the **Doora** project encompasses a full-fledged Smart Environment / Property Management system. Its primary focus is on providing a seamless, real-time interface for controlling physical spaces, making it highly suitable for hotels, smart homes, or office environments.

**Current Scope Inclusions:**
*   **Property Mapping & Visualization:** An admin-centric view to monitor multiple rooms and devices across a property via the interactive `AdminGroundMap`.
*   **Granular Room Control:** Guest interfaces (`GuestApp`, `RoomDashboard`) that provide isolated, secure access to control specific devices within assigned spaces.
*   **Real-Time Infrastructure:** Utilizing MQTT for immediate, low-latency two-way communication between the web interface and physical IoT hardware.
*   **Secure Authentication & Access Control:** Integration with Next-Auth for robust user login and session management, clearly separating Admin (global control) and Guest (local control) privileges.
*   **AI & LLM Capabilities:** Leveraging the Groq SDK (`groq-sdk`) to introduce AI-driven features, which could include natural language voice commands, automated smart routines, or predictive analytics.
*   **Audit & System Diagnostics:** Real-time tracking of system events and device statuses via `SystemLogs` for security, maintenance, and administrative oversight.
