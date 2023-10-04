import { findUserId } from '../fetchData';

export default async function handler(req, res) {
  const data = JSON.parse(req.body);
  const userId = await findUserId(data.username, data.password);
  res.status(200).json({ userId: userId });
}
