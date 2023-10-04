import { checkIfUserExists } from '../fetchData';

export default async function handler(req, res) {
  const data = JSON.parse(req.body);
  const exists = await checkIfUserExists(data.username);
  res.status(200).json({ exists: exists });
}
