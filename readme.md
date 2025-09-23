# TALENTFLOW – A Mini Hiring Platform  

This is a front-end only assessment project built with:  
- **Next.js**  
- **TailwindCSS**  
- **Zustand**  
- **MirageJS**  
- **IndexedDB**  

## 🔑 Login  
- The first page is a dummy auth screen.  
- Enter the username: AKHIL
- Enter the password: ENTNT_ASSESSMENT_PASSWORD  
- Saved in **localStorage** for temporary access to the dashboard.  

## ✨ Features  
- Jobs: create, edit, archive, reorder.  
- Candidates: search, profile view, Kanban stage updates.  
- Assessments: build forms, live preview, validation, local persistence.  
- Data is mocked with MirageJS and stored in IndexedDB.  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (or Neon account)

### Installation

1. **Clone and Install**

   ```bash
   git clone https://github.com/akhil683/wiki-reel.git
   cd wiki-reel
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   NEXT_PUBLIC_USERNAME="AKHIL"
   NEXT_PUBLIC_PASSWORD="ENTNT_ASSESSMENT_PASSWORD"
   ```


## 📊 Project Structure

```
ENTNT/
├── 📁 app/                   # Next.js App Router
│   └── 📁 (dashboard)/       # Main dashboard interface
│       ├── 📁 assessments/                # assessment list interface
│       ├── 📁 candidates/             # candidates list interface
│       └── 📁 home/              # Home interface
│       └── 📁 jobs/              # Jobs interface
├── 📁 components/            # Reusable UI components
│       ├── 📁 ui/                # shadcn UI components components
│       ├── 📁 assessments/                # assessment related components
│       ├── 📁 candidates/             # candidates related components
│       └── 📁 layout/              # Common layout
│       └── 📁 jobs/              # Jobs related components
├── 📁 lib/                   # Utilities & configurations
│   ├── 📁 db/                # indexDB as a database
│   ├── 📁 mock-api/           # mock apis
│   └── 📁 store/             # zustand store service
├── 📁 public/                # Static assets
└── 📁 types/                 # TypeScript definitions
```


