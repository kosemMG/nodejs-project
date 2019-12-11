const fs = require('fs');
const path = require('path');

const storagePath = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(productId, productPrice) {
    // Fetch the previous cart
    fs.readFile(storagePath, ((err, data) => {
      let cart = {products: [], totalPrice: 0};
      if (!err) {
        cart = JSON.parse(data);
      }
      // Analise the cart => find existing product
      const existingProductIndex = cart.products.findIndex(product => product.id === productId);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // Add new product/increase quantity
      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.quantity++;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {id: productId, quantity: 1};
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +productPrice;
      fs.writeFile(storagePath, JSON.stringify(cart), err => console.log(err));
    }));
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(storagePath, ((err, data) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(data);
      const updatedCart = {...cart};
      const product = updatedCart.products.find(product => product.id === id);
      if (!product) {
        return;
      }
      updatedCart.products = updatedCart.products.filter(product => product.id !== id);
      updatedCart.totalPrice -= productPrice * product.quantity;
      fs.writeFile(storagePath, JSON.stringify(updatedCart), err => console.log(err));
    }));
  }

  static getCart(callback) {
    fs.readFile(storagePath, ((err, data) => {
      const cart = JSON.parse(data);
      if (err) {
        callback(null);
      } else {
        callback(cart);
      }
    }));
  }
};
