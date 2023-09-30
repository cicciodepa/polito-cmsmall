'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('database.sqlite', (err) => {
    if (err) throw err;
})

db.run('PRAGMA foreign_keys = ON;')
/*
//Tables creation queries
db.run(`CREATE TABLE blocks(
    id INTEGER PRIMARY KEY NOT NULL, 
    type INTEGER, 
    content TEXT,        
    position INTEGER,
    pageid INTEGER,
    FOREIGN KEY (pageid) REFERENCES pages(id) ON DELETE CASCADE)`);

db.run(`CREATE TABLE pages(
    id INTEGER PRIMARY KEY NOT NULL, 
    author INTEGER, 
    title TEXT,
    creationdate DATE,
    publicationdate DATE,
    FOREIGN KEY (author) REFERENCES users(id))`);



/*
db.run(`CREATE TABLE users(
id INTEGER PRIMARY KEY NOT NULL, 
email VARCHAR(50), 
firstname VARCHAR(50),
lastname VARCHAR(50),
username VARCHAR(50),
password TEXT,
salt TEXT,
role TEXT)`)

db.run(`CREATE TABLE blocksxpage(
blockID INTEGER NOT NULL, 
pageID INTEGER NOT NULL,
FOREIGN KEY (blockID) REFERENCES blocks(id),
FOREIGN KEY (pageID) REFERENCES pages(id),
PRIMARY KEY (blockID, pageID)
ON DELETE CASCADE)`)
*/

module.exports = db;
