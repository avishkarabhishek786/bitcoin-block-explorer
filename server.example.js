// Change username and password with username/password in your bitcoin.conf flo.conf file
// You might also want to change port network and its corresponding port number 

const Client = require('bitcoin-core');
const client = new Client({host: 'localhost', network: 'testnet', username: 'yourusername', password: 'yourpassword', port: 17313
});

module.exports = client;
