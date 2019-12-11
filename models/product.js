const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

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
  constructor(title, imageUrl, price, description, id = null) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(product => product.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(storagePath, JSON.stringify(updatedProducts), err => console.log(err));
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(storagePath, JSON.stringify(products), err => console.log(err));
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      const updatedProducts = products.filter(product => product.id !== id);
      fs.writeFile(storagePath, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(id, product.price)
        } else {
          console.log(err);
        }
      });
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
