<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Slide Generator

A powerful AI-powered slide generator built with React, Vite, and Google Gemini. Create professional presentations with AI-generated content and images.

View your app in AI Studio: https://ai.studio/apps/drive/1XZVpHh-5oeMq79U8NzD_6SfGSLT25ELK

## 🚀 Quick Start

### Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:4000

### Build for Production

```bash
npm run build
npm run preview
```

## 📦 Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your repository

4. Configure environment variables:
   - In the "Environment Variables" section, add:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key from https://makersuite.google.com/app/apikey

5. Click "Deploy"

Vercel will automatically detect the Vite configuration and deploy your app!

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

5. Redeploy with the new environment:
   ```bash
   vercel --prod
   ```

### Environment Variables

The following environment variable is required in production:

- `GEMINI_API_KEY`: Your Google Gemini API key

Get your API key from: https://makersuite.google.com/app/apikey

## 🧪 Testing

Run tests with:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## 📁 Project Structure

```
├── components/          # React components
├── constants/           # App configuration and themes
├── context/             # React context
├── services/            # API services (Gemini, storage, downloads)
├── utils/               # Utility functions
├── schemas/             # Zod schemas
├── tests/               # Test files
└── types.ts             # TypeScript types
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Google Gemini** - AI content generation
- **Tailwind CSS** - Styling
- **html2canvas** - Canvas export
- **jsPDF** - PDF generation
- **pptxgenjs** - PowerPoint export
- **Vitest** - Testing

## 📝 Features

- ✨ AI-generated slide content using Google Gemini
- 🎨 Multiple themes and layouts
- 📊 Export to PDF, PowerPoint, and images
- 🖼️ AI-generated images for slides
- 💾 Local storage for presentations
- ⌨️ Keyboard shortcuts
- 🎯 Presentation mode
- ♿ Accessibility features
- 🔄 Drag and drop slide reordering

## 📄 License

Private project
