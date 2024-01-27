const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const path = require('path');
const app = express();
const port = 3000;

require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

app.post('/aiCompletion', async (req, res) => {
    try {
        const prompt = req.body.userPrompt;
        if (!prompt) {
            return res.status(400).send('No prompt provided');
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-1106-preview',
            messages: [
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": prompt }
            ],
            temperature: 0.8,
            stream: true,
        });

        res.setHeader('Content-Type', 'text/plain');
        for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';
            res.write(text);
        }
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
