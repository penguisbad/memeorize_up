import { updateUser } from '../fetchData';

export default async function handler(req, res) {
  const data = JSON.parse(req.body);
  await updateUser(data.userId, data.newUser);
  res.status(200).json({});
}
