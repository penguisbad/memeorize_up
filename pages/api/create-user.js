import { checkIfUserExists, createUser } from '../fetchData';

export default async function handler(req, res) {
  const data = JSON.parse(req.body);
  if (await checkIfUserExists(data.username)) {
    res.status(200).json({ userId: null });
  } else {
    const userId = await createUser(data.username, data.password);
    res.status(200).json({ userId: userId });
  }
}
