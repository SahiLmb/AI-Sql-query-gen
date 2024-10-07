// pages/api/process_pdfs.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Your FastAPI URL

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const formData = new FormData();
            for (const file of req.files) {
                formData.append('files', file);
            }

            await axios.post(`${API_URL}/process_pdfs/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            res.status(200).json({ message: 'PDFs processed successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process PDFs' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
