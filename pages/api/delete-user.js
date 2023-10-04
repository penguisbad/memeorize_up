import { deleteUser } from '../fetchData';

export default async function handler(req, res) {
  const data = JSON.parse(req.body);
  await deleteUser(data.userId);
  res.status(200).json({});
}
