'use strict';

function User(id, email, firstName, lastName, username, password, salt, role) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.password = password;
    this.salt = salt;
    this.role = role
}

module.exports = User;