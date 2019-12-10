const fs = require('fs');
const path = require('path');

const storagePath = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = callback => {
  fs.readFile(storagePath, (err, data) => {
    if (err) {
      return callback([]);
    }
    callback(JSON.parse(data));
  });
};

module.exports = class Product {
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(storagePath, JSON.stringify(products), err => console.log(err));
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(id, callback) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      callback(product);
    });
  }
};
