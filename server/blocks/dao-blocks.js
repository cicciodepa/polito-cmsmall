'use strict';

const ContentBlock = require('./contentblock');
const db = require('../database.js')

exports.saveBlock = (block) => {
    if (block instanceof ContentBlock) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO blocks(id, type, content, position, pageid) VALUES (?,?,?,?,?)'
            db.run(sql, [null, block.type, block.content, block.position, block.page], function (err) {
                if (err)
                    reject(err.message);
                else {
                    //block.id = this.lastID;
                    resolve(true)
                };
            });

        });
    } else { throw new Error("Block not type of Block.") }
}

exports.updateBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE blocks SET type=?, content=?, position=? WHERE id=?'
        db.run(sql, [block.type, block.content, block.position, block.id], function (err) {
            if (err)
                reject(err.message);
            if (this.changes !== 1) {
                resolve({ error: "No block was updated." })
            } else {
                resolve(block)
            };
        });

    });
}

exports.deleteBlock = (blockid) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM blocks WHERE id=?'
        db.run(sql, [blockid], function (err) {
            if (err)
                reject(err.message);
            if (this.changes !== 1) {
                resolve({ error: "No block deleted." })
            } else {
                resolve({ message: `Block ${this.lastID} deleted.` })
            };
        });

    });
}


exports.getBlocks = (blockIds) => {
    const stringBlocks = "";
    blockIds.map((el, idx, array) => {
        if (array.lenght === (idx + 1) || idx === 0) {
            stringBlocks + ` id = ${el}`;
        } else {
            stringBlocks + ` OR id = ${el}`;
        }
    });
    console.log(stringBlocks);

    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM blocks WHERE ${stringBlocks}`
        db.all(sql, (err, rows) => {
            if (err)
                reject(err)
            else {
                const blocks = rows.map((el) => new ContentBlock(
                    el.id, el.type, el.content, el.pageid
                ));
                resolve(blocks);
            }
        })
    })
}



