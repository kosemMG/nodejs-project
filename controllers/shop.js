const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(error => console.log(error));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products'
      });
    })
    .catch(error => console.log(error));
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            pageTitle: 'Your cart',
            path: '/cart',
            products: products
          });
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  /** @method addProduct */
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then(productData => {
      /** @type {{cartItem: {quantity}}} */
      let product;
      if (productData.length > 0) {
        product = productData[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(productId)
    })
    .then(product => fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
    )
    .then(() => res.redirect('/cart'))
    .catch(error => console.log(error));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.getCart()
    .then(cart => cart.getProducts({ where: { id: productId } }))
    .then(productData => {
      const product = productData[0];
      return product.cartItem.destroy();
    })
    .then(() => res.redirect('/cart'))
    .catch(error => console.log(error));
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] })
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: '/orders',
        orders: orders
      });
    })
    .catch(error => console.log(error));
};

exports.postOrder = (req, res, next) => {
  let products;
  let fetchedCart;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(productsData => {
      products = productsData;
      return req.user.createOrder();
    })
    .then(order => order.addProducts(products.map(product => {
      product.orderItem = { quantity: product.cartItem.quantity };
      return product;
    })))
    .then(() => fetchedCart.setProducts(null))
    .then(() => res.redirect('/orders'))
    .catch(error => console.log(error));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  });
};

