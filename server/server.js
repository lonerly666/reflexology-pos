const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const adminRoute = require('./routes/admin');
const orderRoute = require('./routes/order');
const servicesRoute = require('./routes/service');
const membersRoute = require('./routes/member');
const orderServiceRoute = require('./routes/orderService');
const orderPaymentRoute = require('./routes/orderPayment');
const client_url = 'http://localhost:1212';

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: client_url,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api/admin', adminRoute);
app.use('/api/orders', orderRoute);
app.use('/api/services', servicesRoute);
app.use('/api/members', membersRoute);
app.use('/api/orderServices', orderServiceRoute);
app.use('/api/orderPayments', orderPaymentRoute);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
