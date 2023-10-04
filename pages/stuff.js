const sqlite = require('sqlite3');

const db = new sqlite.Database('../pages/database.sqlite');
db.serialize(() => {
  db.run(
    'CREATE TABLE users (userId varchar(255), username varchar(255), password varchar(255));',
    [],
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  db.run(
    'CREATE TABLE sets (setId varchar(255), userId varchar(255), name varchar(255), description varchar(255), setType varchar(255));',
    [],
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  db.run(
    'CREATE TABLE flashcards (setId varchar(255), front varchar(255), back varchar(255));',
    [],
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
});
db.close();
