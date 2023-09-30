'use strict';

const db = require('./database')

exports.setWebsite = (sitename) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE website SET name = ? WHERE id =1`
        db.run(sql, [sitename], function (err) {
            if (err)
                reject(err.message);
            if (this.changes !== 1) {
                resolve({ error: "No website name was updated." })
            } else {
                resolve({ website: sitename })
            };
        });
    })
}

exports.getWebsite = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT name FROM website WHERE id=1`
        db.get(sql, function (err, row) {
            if (err)
                reject(err.message);
            else {
                resolve(row)
            };
        });
    })
}
