'use strict';

const db = require('../database.js')
const crypto = require('crypto');
const User = require('./user');

exports.getUserFromCredentials = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email=?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = {
          id: row.id,
          email: row.email,
          firstName: row.firstname,
          lastName: row.lastname,
          username: row.username,
          role: row.role
        };

        crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { 
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) 
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.saveUser = (user) => {
  if (user instanceof User) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO
                USERS(id, email, firstName, lastName, username, password, salt, role)
                VALUES (?,?,?,?,?,?,?,?)`
      db.run(sql, [null, user.email, user.firstName, user.lastName, user.username, user.password, user.salt, user.role], (err) => {
        if (err)
          reject(err.message);
        else
          resolve(true);
      });

    });
  } else { throw new Error("User not type of USER.") }
}

exports.listUsernameAndID = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT username, id FROM users'
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows)
      }
    })
  })
}