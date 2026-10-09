require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI (if key provided)
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
    try {
        genAI = new GoogleGenerativeAI(apiKey.trim());
    } catch (err) {
        console.warn('Notice: Gemini AI initialization deferred:', err.message);
    }
}

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
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map(line => line.replace(/^[\d\s•*-]+\.?\s*/, ''));
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return ['Error parsing response. Please try again.'];
    }
}

// Heuristic fallback generator for when GEMINI_API_KEY is not configured
function generateTacticalFallback(text) {
    const lower = (text || '').toLowerCase();
    
    if (lower.includes('desk') || lower.includes('work') || lower.includes('office') || lower.includes('cable') || lower.includes('paper')) {
        return [
            "Clear all loose papers, receipts, and old documents into a single sorting stack",
            "Shred expired invoices, recycle junk mail, and digitize important records",
            "Bundle and route stray cables using velcro ties or an under-desk cable tray",
            "Strip the primary surface completely and reintroduce only your keyboard, mouse, and active work notebook",
            "Relocate pens, stationery, and small gadgets into a single divided drawer tray",
            "Establish a clean-desk policy: wipe and clear the workspace at the end of each working day"
        ];
    }
    
    if (lower.includes('wardrobe') || lower.includes('closet') || lower.includes('cloth') || lower.includes('shirt') || lower.includes('shoe')) {
        return [
            "Remove all garments from the closet and categorize them into everyday wear, seasonal items, and occasion wear",
            "Apply the 6-month rule: identify any clothing item unworn over the past two seasons and stage it for donation",
            "Separate damaged, permanently stained, or ill-fitting garments for textile recycling",
            "Standardize your hangers to a single style to optimize rail spacing and visual uniformity",
            "Group remaining garments by category and tone for instantaneous daily selection",
            "Commit to a strict One-In, One-Out policy for every future wardrobe acquisition"
        ];
    }
    
    if (lower.includes('kitchen') || lower.includes('pantry') || lower.includes('cabinet') || lower.includes('fridge') || lower.includes('food')) {
        return [
            "Empty the pantry shelves onto the countertop and inspect expiration dates on all canned goods and spices",
            "Safely dispose of all expired foodstuffs, stale baking goods, and duplicate open containers",
            "Group active staples (grains, legumes, breakfast items) into clear, airtight storage canisters",
            "Purge excess food storage containers missing lids and consolidate to a matching stackable set",
            "Wipe down all cabinet surfaces and shelf liners before returning only verified daily-use items",
            "Designate one specific shelf exclusively for quick snacks and immediate meals to avoid clutter sprawl"
        ];
    }

    if (lower.includes('garage') || lower.includes('tool') || lower.includes('workbench') || lower.includes('hardware')) {
        return [
            "Clear floor space first by stacking and categorizing scattered materials into dedicated zones",
            "Audit hand and power tools: clean, inspect, and hang frequently used tools on a wall pegboard",
            "Consolidate loose hardware (screws, nails, anchors) into labeled modular compartment bins",
            "Identify duplicate, broken, or obsolete tools and stage them for disposal or donation",
            "Safely dispose of dried-out paints, expired solvents, and chemical containers at an authorized facility",
            "Establish clearly marked perimeter zones for recycling bins, lawn equipment, and seasonal gear"
        ];
    }

    return [
        "Empty the targeted surface or room zone completely to establish an absolute baseline",
        "Sort items into three uncompromising categories: Keep, Donate/Sell, and Immediate Disposal",
        "Question every single item: discard anything that has not been actively utilized in the past 90 days",
        "Group remaining essentials by frequency of use, placing daily-use items in prime ergonomic reach",
        "Wipe and sanitize the cleared surfaces before returning verified essential possessions",
        "Establish a permanent boundary to prevent clutter creep and maintain spatial clarity"
    ];
}

// Routes
app.post('/api/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;

        const declutteringKeywords = ["clutter", "organize", "minimalist", "storage", "sort", "donate", "reduce", "space", "tidy", "dispose", "clear out", "streamline", "arrange", "downsize", "desk", "closet", "wardrobe", "kitchen", "garage", "pantry", "room"];

        function isDeclutteringRelated(inputText) {
            if (!inputText) return false;
            const lowerCaseText = inputText.toLowerCase();
            const greetingKeywords = ["hi", "hello", "how are you", "what's up", "good morning", "good afternoon", "good evening", "hey"];
            const textWords = lowerCaseText.split(/\s+/);
        
            const isGreeting = textWords.every(word => greetingKeywords.includes(word));
            if (isGreeting && textWords.length <= 3) {
                return false;
            }
        
            for (const keyword of declutteringKeywords) {
                if (lowerCaseText.includes(keyword)) {
                    return true;
                }
            }
            return true; // Default to accommodating user space descriptions
        }

        if (!isDeclutteringRelated(text)) {
            return res.json({ suggestions: ["Please describe a space, room, or set of items you would like to declutter and organize."] });
        }

        // Check if Gemini is configured and available
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash",
                    generationConfig: {
                        temperature: 0.7
                    }
                });

                const prompt = `As a minimalist decluttering expert, provide specific, actionable steps for the following situation: ${text}
Please provide 5-7 practical steps that are easy to follow. Focus on minimalist principles, eliminating excess, and sustainable organization.
Format each suggestion as a clear, concise statement without numbering or bullet points.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const suggestions = parseGeminiResponse(response);

                if (suggestions && suggestions.length > 0) {
                    return res.json({ suggestions });
                }
            } catch (apiErr) {
                console.warn('Gemini API call failed, falling back to heuristic engine:', apiErr.message);
            }
        }

        // Seamless fallback if API key is missing or failed
        const fallbackSuggestions = generateTacticalFallback(text);
        res.json({ suggestions: fallbackSuggestions });

    } catch (error) {
        console.error('Error in /api/analyze-text:', error);
        res.status(500).json({ error: 'Error generating suggestions' });
    }
});

app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }

        if (genAI) {
            try {
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
                if (suggestions && suggestions.length > 0) {
                    return res.json({ suggestions });
                }
            } catch (apiErr) {
                console.warn('Gemini image analysis failed, falling back to heuristic engine:', apiErr.message);
            }
        }

        // High-quality image analysis fallback
        const imageFallbackSuggestions = [
            "Identify the highest-density clutter cluster visible in the room and clear floor pathways first",
            "Sort visible surface items into three distinct bins: Keep, Donate, and Immediate Trash",
            "Remove all loose clothing, cables, and packaging from furniture surfaces and bed/chair perimeters",
            "Group similar items (books, electronics, grooming items) into designated container zones",
            "Thoroughly wipe down all newly uncovered table surfaces and shelving units",
            "Establish a clean perimeter boundary to prevent items from spreading back across the room"
        ];

        res.json({ suggestions: imageFallbackSuggestions });

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
        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=decluttering-plan.pdf');

        doc.pipe(res);

        // Header styling
        doc.fontSize(22)
           .font('Helvetica-Bold')
           .text('DECLUTTER // ACTION DOSSIER', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica')
           .text(`GENERATED: ${new Date().toLocaleDateString()} // STATUS: VERIFIED MINIMALIST`, { align: 'center' })
           .moveDown(1.5);

        doc.fontSize(13)
           .font('Helvetica-Bold')
           .text('TACTICAL ACTION CHECKLIST:', { underline: true })
           .moveDown(0.8);

        (suggestions || []).forEach((suggestion, index) => {
            const stepNum = String(index + 1).padStart(2, '0');
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .text(`[ ] TASK ${stepNum}: `, { continued: true })
               .font('Helvetica')
               .text(suggestion)
               .moveDown(0.6);
        });

        doc.moveDown(1.5);
        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .text('DECLUTTER // A STUDY IN ESSENTIAL LIVING', { align: 'center' });

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
