// pages/api/ask_question.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Your FastAPI URL

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { question } = req.body;

        // Check if the question is provided
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        try {
            const response = await axios.post(`${API_URL}/ask_question/`, { question });

            // Assuming the backend returns the response in a JSON format
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error getting a response:', error.message);

            // Provide the error message in the response
            res.status(500).json({ error: 'Failed to get a response', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
