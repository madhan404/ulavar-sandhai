# 🌾 👨‍🌾 உழவர் சந்தை - Farmer's Marketplace  🍅


A full-stack MERN-like (React with Vite, Node.js, MySQL) e-commerce app connecting farmers and customers, featuring role-based authentication, product listings, real-time order and logistics management. 🚜 🛒 🍅

<!-- ![Farmer Logo](client/public/farmer.png) -->


<img src="client/public/farmer.png" alt="Farmer Logo" width="120">



## 🚦 Tech Stack
<p align="left"> <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"/> <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express"/> <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL"/> <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"/> <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"/> <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS"/> <img src="https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=white" alt="JWT"/> </p>


## ✨ Features
👨‍🌾 Farmer Features
📦 Post products including images, descriptions, prices

📝 Manage product listings (edit, delete)

📊 Track orders placed on their products

🛒 Customer Features
🔍 Browse and search products by farmers

🛒 Add products to cart and place orders

📦 Track order status in real-time

👤 Manage profile and view order history

🏢 Admin Features
👥 Manage users (farmers, customers, logistics staff)

🏬 Approve or reject product listings

🚚 Assign and manage logistics staff for deliveries

📦 Oversee all orders and update statuses

🚛 Logistics/Staff Features
🛠 View assigned delivery orders

🔄 Update order status (Picked Up → In Transit → Delivered)

⚡ Real-time updates for customers and admins

---


## 📂 Project Structure

ulavar-sandhai/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── farmerController.js
│   │   │   ├── customerController.js
│   │   │   └── logisticsController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   └── Logistics.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── farmer.js
│   │   │   ├── customer.js
│   │   │   └── logistics.js
│   │   └── middleware/
│   │       └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── client/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── App.jsx
    └── package.json


---


## 🚀 Getting Started

## 1️⃣ Clone the repository
bash
git clone https://github.com/madhan404/ulavar-sandhai.git
cd ulavar-sandhai

## 2️⃣ Backend Setup
bash
cd server
npm install


## Create .env in server/: 🐬 - 🔧

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ulavarsandhai
JWT_SECRET=your_secret_jwt_key
PORT=5000
NODE_ENV=development


Start the backend server:

bash
npm start
Backend runs on 👉 http://localhost:3000

##  3️⃣ Frontend Setup
bash
cd ../client
npm install
npm run dev
Frontend runs on 👉 http://localhost:5173

---

## 👥 User Roles

| Role     | Capabilities                                |
|----------|--------------------------------------------|
| Admin    | Manage users, products, orders, logistics |
| Farmer   | Post/manage products, view orders          |
| Customer | Browse products, place orders, track orders|
| Logistics| Update order status, manage deliveries     |

---

> **Default admin user creation:**

UPDATE users SET role = 'admin' WHERE email = 'admin@ulavarsandhai.com';

##  🔗 API Endpoints

##  Authentication

POST /api/auth/register - Register user

POST /api/auth/login - Login user

GET /api/auth/me - Get current user's info


##  Farmer

POST /api/farmer/products - Add product

GET /api/farmer/products - List farmer's products

PATCH /api/farmer/products/:id - Update product

DELETE /api/farmer/products/:id - Delete product


##  Customer

GET /api/products - List all products

POST /api/orders - Place order

GET /api/orders - Get customer's orders


##  Admin

GET /api/admin/users - View users

PATCH /api/admin/users/:id - Update user role/status

GET /api/admin/orders - Manage orders

PATCH /api/admin/orders/:id/assign-logistics - Assign logistics staff


##  Logistics

GET /api/logistics/orders - Assigned delivery orders

PATCH /api/logistics/orders/:id/status - Update order status


##  📦 Order Status Flow

⏳ Pending
✅ Approved
🚚 Picked Up
🔄 In Transit
🎉 Delivered


##  🔮 Future Enhancements

💳 Payment gateway integration (Stripe, PayPal, Razorpay)

🔔 Push notifications for order status updates

⭐ Ratings & reviews for products and farmers

📊 Analytics dashboard for admins and farmers

🎁 Promo codes and discounts

📍 Multiple delivery addresses


##  💡 Development Notes

All passwords are securely hashed

JWT used for authentication and role-based authorization

Protected routes ensure security and role access

MySQL DB schema enforces data integrity

Clean separation of concerns in controllers, models, routes

##  🤝 Contributing
Contributions are welcome! 🎉 Please open an issue for suggestions or bugs before making major changes.


##  📄 MIT License
 This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.  


##  🙋‍♂️ Contact
Made with ❤️ by [Madhanraj S](https://github.com/madhan404) உழவர் சந்தை Team


## 🌐 Website: [ உழவர் சந்தை ](https://ulavarsandhai.netlify.app/)