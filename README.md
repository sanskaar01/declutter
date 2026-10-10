# AI Declutter Guide

An AI-powered web application that helps users declutter their spaces using the Gemini API. The application provides personalized decluttering suggestions based on text descriptions and image analysis.

## Features

- Text-based decluttering suggestions
- Image analysis for cluttered spaces
- 7-day minimalist challenge
- PDF download of personalized decluttering plans
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Gemini API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-declutter-guide
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Text-based Analysis**
   - Enter a description of your cluttered space
   - Click "Get Suggestions" to receive personalized decluttering steps

2. **Image-based Analysis**
   - Upload an image of your cluttered space
   - Click "Analyze Space" to get AI-powered suggestions

3. **7-Day Challenge**
   - Click "Start Challenge" to begin the minimalist challenge
   - Complete each day's task and track your progress

4. **Download Plans**
   - After receiving suggestions, click "Download Plan" to get a PDF version

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: Google Gemini API
- PDF Generation: PDFKit
- Image Processing: Multer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 