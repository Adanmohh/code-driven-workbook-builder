# Code-Driven Workbook Builder

A web application that transforms screenshots and PDFs into editable, brand-ready workbooks with fully visible and modifiable source code in the browser.

## Features

- **File Import**: Upload PDF or image files (PNG, JPG, JPEG) up to 100MB
- **AI-Powered Generation**: Automatically converts content into React components using Claude API
- **Live Code Editor**: Integrated Sandpack editor with hot-reload preview
- **Page Navigation**: Thumbnail-based page navigator for multi-page workbooks
- **Brand Kit**: Customizable colors, fonts, and logo with instant preview updates
- **AI Assistant**: Per-page AI-powered editing with contextual prompts
- **Export Options**: Print-ready output and PDF export functionality

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Sandpack for in-browser code editing
- Lucide React for icons

### Backend
- FastAPI + Uvicorn
- Claude Code SDK for AI generation
- pdfminer.six for PDF text extraction
- pytesseract for OCR from images

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Claude Code CLI installed globally (`npm install -g claude-code`)
- (Optional) E2B API key for sandbox execution

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd code-driven-workbook-builder
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt

# Create .env file and add your API keys:
# E2B_API_KEY=your_key_here (optional)
# Claude Code SDK uses local Claude Code CLI - no API key needed
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python main.py
```
The API will be available at http://localhost:8000

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```
The application will be available at http://localhost:5173

## Usage

1. **Upload a File**: Drag and drop or click to upload a PDF or image file
2. **Edit Code**: Use the code editor to modify individual pages
3. **Customize Brand**: Adjust colors and fonts in the Brand Kit panel
4. **AI Assistance**: Use the AI assistant to make page-specific changes
5. **Export**: Print or download your workbook as a PDF

## API Endpoints

- `POST /api/generate` - Generate workbook from uploaded file
- `POST /api/rewrite_page` - AI-powered page rewriting
- `POST /api/rewrite_global` - Apply changes across multiple pages
- `POST /api/brand` - Generate brand-specific styles
- `GET /health` - Health check endpoint

## Development

### Project Structure
```
code-driven-workbook-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── main.py
│   └── requirements.txt
└── README.md
```

### Key Components
- **FileUpload**: Handles file selection and upload
- **PageNavigator**: Displays page thumbnails and navigation
- **Editor**: Sandpack-based code editor with live preview
- **PreviewCanvas**: Renders the current page with brand styles
- **BrandPanel**: Controls for colors, fonts, and logo
- **AIAssistant**: Chat interface for AI-powered editing

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]