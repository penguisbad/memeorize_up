const fs = require('fs');

export function findUser(userId) {
  return new Promise((resolve, reject) => {
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const users = JSON.parse(data);
      for (const user of users) {
        if (user.userId === userId) {
          resolve(user);
          return;
        }
      }
      resolve(null);
    });
  });
}
export function findUserId(username, password) {
  return new Promise((resolve, reject) => {
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const users = JSON.parse(data);
      for (const user of users) {
        if (user.username === username && user.password === password) {
          resolve(user.userId);
          return;
        }
      }
      resolve(null);
    });
  });
}
export function checkIfUserExists(username) {
  return new Promise((resolve, reject) => {
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const users = JSON.parse(data);
      for (const user of users) {
        if (user.username === username) {
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
  });
}
export function createUser(username, password) {
  return new Promise((resolve, reject) => {
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      let users = JSON.parse(data);
      const userId = crypto.randomUUID();
      users.push({
        userId: userId,
        username: username,
        password: password,
        sets: [],
        folders: [],
      });
      fs.writeFile('pages/data.txt', JSON.stringify(users), (err) => {
        if (err) {
          console.log(err);
          return;
        }
        resolve(userId);
      });
    });
  });
}
export function updateUser(userId, newUser) {
  return new Promise((resolve, reject) => {
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      let users = JSON.parse(data);
      users[users.findIndex((user) => user.userId === userId)] = newUser;
      fs.writeFile('pages/data.txt', JSON.stringify(users), (err) => {
        if (err) {
          console.log(err);
          return;
        }
        resolve(0);
      });
    });
  });
}
export function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    console.log(userId);
    fs.readFile('pages/data.txt', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      let users = JSON.parse(data);
      users = users.filter((user) => user.userId !== userId);
      fs.writeFile('pages/data.txt', JSON.stringify(users), (err) => {
        if (err) {
          console.log(err);
          return;
        }
        resolve(0);
      });
    });
  });
}
