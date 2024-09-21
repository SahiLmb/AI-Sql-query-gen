import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userInput } = req.body;
    try {
      const response = await axios.post('http://localhost:8000/query/', { user_input: userInput });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error querying the database' });
    }
  }
}
