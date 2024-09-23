import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const formData = req.body;
      const response = await axios.post('${process.env.NEXT_PUBLIC_API_URL}`cvbsdf g/upload-database/', formData);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error uploading the database' });
    }
  }
}
