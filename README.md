# Radar - Frontend

Radar is a modern ticketing platform designed to streamline event management and ticket purchasing. This repository contains the frontend application built with Next.js.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client:** [Axios](https://axios-http.com/)

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or later)
- npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Radar-OAU/Frontend.git
    cd Frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add your API URL:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                # Next.js App Router pages and layouts
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   └── ...
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn UI primitives
│   └── ...
├── lib/                # Utilities and configurations (axios, utils)
├── store/              # Zustand state stores
└── ...
```

## 📅 Week 1 Deliverables

- [x] **Login Page:** Fully functional with UI/UX implementation.
- [ ] **Signup Page:** Registration functionality.
- [ ] **Logout Functionality:** Secure session termination.
- [x] **Protected Routes:** Route guarding for authenticated users.
- [x] **Axios Instance:** Configured with interceptors for auth tokens.
- [x] **Project Structure:** Organized folder hierarchy.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.