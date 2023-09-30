'use strict';

function ContentBlock(id, type, content, position, page) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.position = position;
    this.page = page;
}

module.exports = ContentBlock;