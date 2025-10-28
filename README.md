# RTM Admin React Dashboard

A modern, responsive admin dashboard built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Beautiful dark theme with RTM brand colors
- **Authentication**: Sign-in page with form validation
- **Dashboard**: Comprehensive admin dashboard with stats and activities
- **Fast Development**: Powered by Vite for lightning-fast development

## 🎨 Design System

### Color Palette
- **Gold**: Primary brand color (`#eab308` to `#422006`)
- **Dark**: Background and text colors (`#262626` to `#f6f6f6`)
- **Semantic Colors**: Success, warning, error, and info states

### Components
- Button variants: default, destructive, outline, secondary, ghost, link
- Input fields with icons and validation states
- Cards with headers, content, and footers
- Responsive grid layouts

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── utils.ts      # Utility functions
├── pages/
│   ├── SignIn.tsx    # Authentication page
│   └── Dashboard.tsx # Main dashboard
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🎯 Pages

### Sign In Page
- Email and password authentication
- Form validation
- Loading states
- Responsive design
- RTM branding

### Dashboard Page
- Statistics overview
- Recent activities feed
- Analytics placeholder
- User management interface
- Logout functionality

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Colors
Colors are defined in `tailwind.config.js` and can be customized:
- Gold palette for primary actions
- Dark palette for backgrounds and text
- Semantic colors for states

### Components
All shadcn/ui components can be customized by modifying the component files in `src/components/ui/`.

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Development

The project uses:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality

## 📄 License

This project is part of the RTM ecosystem and is proprietary software.