'use strict';

const dayjs = require('dayjs');

function Page(id, author, title, creationDate, publicationDate) {
    this.id = id;
    this.author = author;
    this.title = title;
    this.creationDate = creationDate ? dayjs(creationDate).format('YYYY-MM-DD HH:mm') : '';
    this.publicationDate = publicationDate ? dayjs(publicationDate).format("YYYY-MM-DD") : "";
}
module.exports = Page;