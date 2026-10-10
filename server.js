require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Helper function to parse Gemini response
function parseGeminiResponse(response) {
    try {
        const text = response.text();
        // Split by newlines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim());
        // Remove any numbering or bullet points from the start of lines
        return lines.map(line => line.replace(/^[\d\s•-]+\.?\s*/, ''));
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return ['Error parsing response. Please try again.'];
    }
}

// Routes
app.post('/api/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;

        // Define decluttering keywords (you can adjust this list)
        const declutteringKeywords = ["clutter", "organize", "minimalist", "storage", "sort", "donate", "reduce", "space", "tidy", "dispose", "clear out", "streamline", "arrange", "downsize"];

        // Function to check if the input is related to decluttering
        function isDeclutteringRelated(inputText) {
            if (!inputText) return false;
            const lowerCaseText = inputText.toLowerCase();
            const greetingKeywords = ["hi", "hello", "how are you", "what's up", "good morning", "good afternoon", "good evening", "hey","age","ipl"];
            const textWords = lowerCaseText.split(/\s+/); // Split into words
        
            // Check if the input is primarily a greeting
            const isGreeting = textWords.every(word => greetingKeywords.includes(word));
        
            if (isGreeting && textWords.length <= 5) { // Adjust length as needed
                return false; // Treat simple greetings as out-of-domain
            }
        
            // Check for the presence of decluttering keywords
            for (const keyword of declutteringKeywords) {
                if (lowerCaseText.includes(keyword)) {
                    return true;
                }
            }
            return false;
        }

        if (isDeclutteringRelated(text)) {
            // Process as a decluttering query
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: {
                    temperature: 0.7
                }
            });

            const prompt = `As a decluttering expert, provide specific, actionable suggestions for the following situation: ${text}
            Please provide 5-7 practical steps that are easy to follow. Focus on minimalist principles and sustainable organization.
            Format each suggestion as a clear, concise statement without numbering or bullet points.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const suggestions = parseGeminiResponse(response);

            res.json({ suggestions });
        } else {
            // Respond to out-of-domain query
            res.json({ suggestions: ["Sorry, I cannot help with questions outside of decluttering."] });
        }
    } catch (error) {
        console.error('Error analyzing text:', error);
        res.status(500).json({ error: 'Error generating suggestions' });
    }
});

app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7
            }
        });
        

        const prompt = `You are an expert decluttering consultant. Analyze this image of a cluttered space and provide a detailed decluttering plan.
        Consider the following aspects:
        1. Identify main areas of clutter
        2. Suggest specific items to keep, donate, or discard
        3. Recommend storage solutions
        4. Provide step-by-step action items
        5. Include minimalist principles in your suggestions
        
        Format your response as clear, actionable steps without numbering or bullet points.`;

        // Generate content with both prompt and image using multimodal capabilities
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: req.file.buffer.toString('base64'),
                    mimeType: req.file.mimetype
                }
            }
        ]);

        const response = await result.response;
        const suggestions = parseGeminiResponse(response);

        res.json({ suggestions });
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ 
            error: 'Error analyzing image',
            details: error.message 
        });
    }
});

app.post('/api/download-plan', async (req, res) => {
    try {
        const { suggestions } = req.body;
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=decluttering-plan.pdf');

        doc.pipe(res);

        // Add title
        doc.fontSize(20)
           .text('Your Personalized Decluttering Plan', { align: 'center' })
           .moveDown();

        // Add date
        doc.fontSize(12)
           .text(`Generated on: ${new Date().toLocaleDateString()}`)
           .moveDown();

        // Add suggestions
        doc.fontSize(14)
           .text('Decluttering Steps:', { underline: true })
           .moveDown();

        suggestions.forEach((suggestion, index) => {
            doc.fontSize(12)
               .text(`${index + 1}. ${suggestion}`)
               .moveDown();
        });

        // Add footer
        doc.fontSize(10)
           .text('Generated by AI Declutter Guide', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
