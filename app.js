// Module constants.
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Custom constants.
const errorController = require('./controllers/error');
const sequelize = require('./util/db');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

// Setting a view engine.
app.set('view engine', 'ejs');
app.set('views', 'views');

// Parsing a request body.
app.use(bodyParser.urlencoded({ extended: false }));

// Setting a public directory.
app.use(express.static(path.join(__dirname, 'public')));

// Setting a dummy user into the request.
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => console.log(error));
});

// Setting routes.
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Setting tables relations.
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
Cart.belongsTo(User);
User.hasOne(Cart);  // Actually, one direction relation is enough.
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// Creating tables and starting a server.
sequelize.sync()
  .then(() => User.findByPk(1))
  .then(user => {
    if (!user) {
      return User.create({ name: 'Moshe', email: 'glbrgm@gmail.com' });
    }
    return user;
  })
  .then(user => user.createCart())
  .then(() => {
    // console.log(user);
    app.listen(3000);
  })
  .catch(err => console.log(err));
