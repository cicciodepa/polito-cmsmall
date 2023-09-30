'use strict';

const db = require('../database.js')
const Page = require('./page');

exports.savePage = (page) => {
    if (page instanceof Page) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO 
                pages(id, author, title, creationDate, publicationDate) 
                VALUES (?,?,?,?,?)`
            db.run(sql, [null,
                page.author,
                page.title,
                page.creationDate,
                page.publicationDate], function (err) {
                    if (err) { reject(err.message); }
                    else { resolve(this.lastID); }
                });

        });
    } else { throw new Error("Page not type of PAGE.") }
}

exports.updatePage = (page, sql, params) => {
    if (page instanceof Page) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) {
                    reject(err.message);
                }
                if (this.changes !== 1) {
                    resolve({ message: 'No page was updated.' })
                } else {
                    resolve({ message: `Page updated.`, page: page })
                }
            })
        })
    }
}

exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM pages WHERE id = ?`;
        db.run(sql, [id], function (err) {
            if (err) {
                console.log(err)
                reject(err.message);
            } else {
                resolve({ message: 'Page deleted', changes: this.changes });
            }
        });
    });
};


exports.getRawPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * 
            FROM pages 
            WHERE id = ?`
        db.get(sql, [id], (err, row) => {
            if (err) { reject(err) }
            else {
                resolve(row)
            }
        })
    })
}
exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT
        p.id AS pageid, p.title, p.creationdate, p.publicationdate, p.author,
        u.username, 
        b.content, b.type, b.id AS blockid, b.position
      FROM
        pages p, users u, blocks b
      WHERE
        p.id = ? AND b.pageid = p.id AND p.author = u.id`
        db.all(sql, [id], (err, rows) => {
            if (err) { reject(err) }
            else {
                if (rows.length === 0) {
                    resolve({error: `No page found with id: ${id}`});
                    return
                }
                const page = {
                    id: rows[0].pageid,
                    author: rows[0].username,
                    authorID: rows[0].author,
                    title: rows[0].title,
                    creationDate: rows[0].creationdate,
                    publicationDate: rows[0].publicationdate,
                    contents: []
                }
                rows.forEach(row => {
                    //console.log(row)
                    page.contents.push({
                        id: row.blockid,
                        type: row.type,
                        content: row.content,
                        position: row.position,
                        pageid: row.pageid
                    })

                })
                resolve(page)
            }
        })
    })
}

exports.listPages = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT
            p.id AS pageid, p.title, p.creationdate, p.publicationdate, p.author,
            u.username, 
            b.content, b.type, b.id AS blockid, b.position, b.pageid AS bpid
            FROM pages p, users u, blocks b
            WHERE p.id = b.pageid  AND p.author = u.id`
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                //formatting response in order to do less frontend work
                const pages = [];
                rows.forEach(row => {
                    const page = pages.find(el => el.id === row.pageid)
                    if (page) {
                        page.contents.push({
                            id: row.blockid,
                            type: row.type,
                            content: row.content,
                            position: row.position,
                            pageid: row.pageid
                        })
                    } else {
                        pages.push({
                            id: row.pageid,
                            author: row.username,
                            authorID: row.author,
                            title: row.title,
                            creationDate: row.creationdate,
                            publicationDate: row.publicationdate,
                            order: row.contentORDER,
                            contents: [{
                                id: row.blockid,
                                type: row.type,
                                content: row.content,
                                position: row.position,
                                pageid: row.pageid
                            }]
                        })
                    }
                })
                resolve(pages)
            }
        })
    })
}

exports.pageExistsById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS count FROM pages WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    })
} 