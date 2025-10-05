-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (x86_64)
--
-- Host: localhost    Database: agricultural_marketplace
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `permissions` text,
  `office_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,1,'Administration','System Administrator',NULL,'Main Office','2025-09-22 16:50:00','2025-09-22 16:50:00'),(2,2,'Administration','System Administrator',NULL,'Main Office','2025-09-22 16:50:00','2025-09-22 16:50:00'),(3,3,'Administration','System Administrator',NULL,'Main Office','2025-09-22 16:50:00','2025-09-22 16:50:00'),(4,28,'Administration','System Administrator',NULL,'Main Office','2025-09-22 16:50:00','2025-09-22 16:50:00');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buyers`
--

DROP TABLE IF EXISTS `buyers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `default_address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `buyers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buyers`
--

LOCK TABLES `buyers` WRITE;
/*!40000 ALTER TABLE `buyers` DISABLE KEYS */;
INSERT INTO `buyers` VALUES (1,30,'123 Main Street, Andheri West','Mumbai','Maharashtra','400001','2025-09-03 15:05:02'),(2,36,'456 Park Avenue, Bandra East','Mumbai','Maharashtra','400002','2025-09-03 15:05:05'),(3,37,'789 Connaught Place, New Delhi','Delhi','Delhi','110001','2025-09-03 15:05:13'),(7,38,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','2025-09-22 17:22:31');
/*!40000 ALTER TABLE `buyers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,38,42,8,'2025-09-22 17:25:32','2025-09-22 17:31:25'),(2,38,43,6,'2025-09-22 17:25:36','2025-09-22 17:31:27'),(3,38,41,21,'2025-09-22 17:25:48','2025-09-22 18:49:42'),(6,38,45,16,'2025-09-22 18:46:26','2025-09-22 18:49:51');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_hindi` varchar(100) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Vegetables','सब्जियां','Fresh vegetables from local farms',NULL,'2025-09-03 15:03:52'),(2,'Fruits','फल','Seasonal and exotic fruits',NULL,'2025-09-03 15:03:52'),(3,'Grains','अनाज','Rice, wheat, pulses and other grains',NULL,'2025-09-03 15:03:52'),(4,'Dairy','दूध','Milk, curd, butter and dairy products',NULL,'2025-09-03 15:03:52'),(5,'Spices','मसाले','Fresh and dried spices',NULL,'2025-09-03 15:03:52'),(6,'Herbs','जड़ी बूटी','Medicinal and culinary herbs',NULL,'2025-09-03 15:03:52'),(7,'Organic Produce','जैविक उत्पाद','Certified organic fruits, vegetables, and grains',NULL,'2025-09-03 15:18:31'),(8,'Exotic Vegetables','विदेशी सब्जियां','Imported and specialty vegetables',NULL,'2025-09-03 15:18:31'),(9,'Local Varieties','स्थानीय किस्में','Traditional and local crop varieties',NULL,'2025-09-03 15:18:31'),(10,'Seasonal Fruits','मौसमी फल','Fruits available during specific seasons',NULL,'2025-09-03 15:18:31'),(11,'Fresh Herbs','ताजी जड़ी बूटी','Medicinal and culinary herbs',NULL,'2025-09-03 15:18:31'),(12,'Dry Fruits','सूखे मेवे','Nuts, dried fruits, and seeds',NULL,'2025-09-03 15:18:31'),(13,'Fresh Flowers','ताजे फूल','Fresh cut flowers and bouquets',NULL,'2025-09-03 15:18:31'),(14,'Honey & Bee Products','शहद और मधुमक्खी उत्पाद','Pure honey and bee-related products',NULL,'2025-09-03 15:18:31'),(15,'Millets','बाजरा','Traditional Indian millets and grains',NULL,'2025-09-03 15:18:31'),(16,'Pulses','दालें','Various types of lentils and pulses',NULL,'2025-09-03 15:18:31'),(17,'Oil Seeds','तिलहन','Oil-producing seeds and nuts',NULL,'2025-09-03 15:18:31'),(18,'Fresh Mushrooms','ताजे मशरूम','Fresh and cultivated mushrooms',NULL,'2025-09-03 15:18:31'),(19,'Bamboo Products','बांस उत्पाद','Bamboo-based agricultural products',NULL,'2025-09-03 15:18:31'),(20,'Medicinal Plants','औषधीय पौधे','Plants with medicinal properties',NULL,'2025-09-03 15:18:31'),(21,'Aromatic Rice','सुगंधित चावल','Special varieties of aromatic rice',NULL,'2025-09-03 15:18:31'),(22,'tomato','vegetables','all are fresh',NULL,'2025-09-22 14:44:12');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmers`
--

DROP TABLE IF EXISTS `farmers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farmers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `aadhaar_number` varchar(12) DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `bank_account_number` varchar(20) DEFAULT NULL,
  `bank_ifsc_code` varchar(11) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `pickup_address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `kyc_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `kyc_documents` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `farmers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmers`
--

LOCK TABLES `farmers` WRITE;
/*!40000 ALTER TABLE `farmers` DISABLE KEYS */;
INSERT INTO `farmers` VALUES (9,4,'123456789012','ABCDE1234F','22AAAAA0000A1Z5','1234567890123456','SBIN0001234','State Bank of India',NULL,'Village: Ramgarh, Post: Ramgarh, Tehsil: Sikar','Sikar','Rajasthan','332001','approved',NULL,NULL,'2025-09-03 14:59:12'),(31,5,'234567890123','BCDEF2345G','33BBBBB0000B2Z6','2345678901234567','HDFC0034','HDFC Bank',NULL,'House No: 45, Street: Gandhi Marg, Colony: New Colony','Jaipur','Rajasthan','302001','approved',NULL,NULL,'2025-09-03 15:00:32'),(32,8,'567890123456','EFGHI5678J','66EEEEE0000E5Z9','5678901234567890','BOB0001234','Bank of Baroda',NULL,'Village: Meera Nagar, Post: Meera Nagar, Tehsil: Alwar','Alwar','Rajasthan','301001','approved',NULL,NULL,'2025-09-03 15:01:56'),(33,9,'678901234567','FGHIJ6789K','77FFFFF0000F6Z0','6789012345678901','SBI0001234','State Bank of India',NULL,'House No: 123, Street: Temple Road, Colony: Old City','Ajmer','Rajasthan','305001','approved',NULL,NULL,'2025-09-03 15:02:06'),(34,10,'789012345678','GHIJK7890L','88GGGGG0000G7Z1','7890123456789012','HDFC0001234','HDFC Bank',NULL,'Farm: Sunshine Fields, Village: Kavita Nagar, Post: Kavita Nagar','Bikaner','Rajasthan','334001','approved',NULL,NULL,'2025-09-03 15:02:17'),(35,31,'123456789012','ABCDE1234F','27ABCDE1234F1Z5','12345678901','SBIN0001234','State Bank of India',NULL,'Farm House 1, Village Road, Thane','Mumbai','Maharashtra','400003','approved',NULL,NULL,'2025-09-03 15:05:45'),(36,32,'234567890123','FGHIJ5678K','07FGHIJ5678K1Z5','23456789012','HDFC0001234','HDFC Bank',NULL,'Organic Farm, Outer Ring Road, Delhi','Delhi','Delhi','110002','pending',NULL,NULL,'2025-09-03 15:05:47'),(37,33,'345678901234','KLMNO9012P','27KLMNO9012P1Z5','34567890123','ICIC0001234','ICICI Bank',NULL,'Green Valley Farm, Pune-Mumbai Highway','Pune','Maharashtra','411001','approved',NULL,NULL,'2025-09-03 15:05:50'),(38,34,'456789012345','PQRST3456U','24PQRST3456U1Z5','45678901234','UTIB0001234','Axis Bank',NULL,'Fresh Harvest Farm, Ahmedabad','Ahmedabad','Gujarat','380001','pending',NULL,NULL,'2025-09-03 15:05:55'),(39,35,'567890123456','UVWXY6789Z','33UVWXY6789Z1Z5','56789012345','CNRB0001234','Canara Bank',NULL,'Southern Farm, Chennai','Chennai','Tamil Nadu','600001','pending',NULL,NULL,'2025-09-03 15:05:59');
/*!40000 ALTER TABLE `farmers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logistics`
--

DROP TABLE IF EXISTS `logistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `status` enum('picked','in_transit','out_for_delivery','delivered','failed','returned') DEFAULT 'picked',
  `estimated_delivery` date DEFAULT NULL,
  `actual_delivery` date DEFAULT NULL,
  `pod_upload_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `logistics_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logistics`
--

LOCK TABLES `logistics` WRITE;
/*!40000 ALTER TABLE `logistics` DISABLE KEYS */;
INSERT INTO `logistics` VALUES (1,1,NULL,NULL,'out_for_delivery',NULL,NULL,NULL,'2025-09-22 19:41:31','2025-09-22 19:51:38'),(2,2,NULL,NULL,'in_transit',NULL,NULL,NULL,'2025-09-22 19:51:44','2025-09-22 19:51:44'),(3,3,NULL,NULL,'picked',NULL,NULL,NULL,'2025-09-22 19:51:47','2025-09-22 19:51:47'),(4,4,NULL,NULL,'delivered',NULL,NULL,NULL,'2025-09-22 19:51:48','2025-09-22 19:51:48'),(5,5,'professional couriers erode','21dummy_number','delivered','2025-09-24',NULL,NULL,'2025-09-22 19:51:50','2025-09-22 19:52:24');
/*!40000 ALTER TABLE `logistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logistics_profiles`
--

DROP TABLE IF EXISTS `logistics_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logistics_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `service_area` text,
  `vehicle_type` varchar(100) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `logistics_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logistics_profiles`
--

LOCK TABLES `logistics_profiles` WRITE;
/*!40000 ALTER TABLE `logistics_profiles` DISABLE KEYS */;
INSERT INTO `logistics_profiles` VALUES (1,29,'Logistics Company','All Areas','Truck','Primary Contact','','2025-09-22 16:45:45','2025-09-22 16:51:09'),(2,39,'Logistics Company','All Areas','Truck','Primary Contact',NULL,'2025-09-22 16:45:45','2025-09-22 16:45:45'),(3,40,'Logistics Company','All Areas','Truck','Primary Contact',NULL,'2025-09-22 16:45:45','2025-09-22 16:45:45');
/*!40000 ALTER TABLE `logistics_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `buyer_id` int NOT NULL,
  `farmer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT '5.00',
  `commission_amount` decimal(10,2) NOT NULL,
  `delivery_address` text NOT NULL,
  `delivery_city` varchar(100) NOT NULL,
  `delivery_state` varchar(100) NOT NULL,
  `delivery_pincode` varchar(20) NOT NULL,
  `payment_method` enum('cod','online') DEFAULT 'cod',
  `status` enum('placed','accepted','rejected','shipped','delivered','cancelled') DEFAULT 'placed',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `buyer_id` (`buyer_id`),
  KEY `farmer_id` (`farmer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD1758569766982185',7,33,45,16,60.00,960.00,5.00,48.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','delivered','pending','2025-09-22 19:36:06','2025-09-22 19:43:35'),(2,'ORD1758569766986613',7,32,47,1,22.00,22.00,5.00,1.10,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-22 19:36:06','2025-09-22 19:36:06'),(3,'ORD1758569766989959',7,32,44,3,80.00,240.00,5.00,12.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-22 19:36:06','2025-09-22 19:36:06'),(4,'ORD1758569766990257',7,31,41,21,40.00,840.00,5.00,42.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','delivered','pending','2025-09-22 19:36:06','2025-09-22 19:51:48'),(5,'ORD1758569766993165',7,32,43,6,120.00,720.00,5.00,36.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','delivered','pending','2025-09-22 19:36:06','2025-09-22 19:51:50'),(6,'ORD1758569766995869',7,31,42,8,25.00,200.00,5.00,10.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-22 19:36:06','2025-09-22 19:36:06'),(7,'ORD1758638714966586',7,33,45,16,60.00,960.00,5.00,48.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14'),(8,'ORD1758638714981558',7,32,47,1,22.00,22.00,5.00,1.10,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14'),(9,'ORD1758638714983576',7,32,44,3,80.00,240.00,5.00,12.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14'),(10,'ORD1758638714985417',7,31,41,21,40.00,840.00,5.00,42.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14'),(11,'ORD1758638714986682',7,32,43,6,120.00,720.00,5.00,36.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14'),(12,'ORD1758638714988270',7,31,42,8,25.00,200.00,5.00,10.00,'321 MG Road, Bangalore','Bangalore','Karnataka','560001','cod','placed','pending','2025-09-23 14:45:14','2025-09-23 14:45:14');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('razorpay','upi','cod') NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_hindi` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `min_order_quantity` int DEFAULT '1',
  `images` json DEFAULT NULL,
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `harvest_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `farmer_id` (`farmer_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (41,31,1,'Fresh Tomatoes',NULL,'Organic red tomatoes from our farm',40.00,'kg',58,1,'[\"https://cdn.classfmonline.com/imagelib/thumbs/47944006.jpg\", \"https://wowtam.com/wp-content/uploads/2022/05/TOMATO-1-696x392.jpg\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-23 14:45:14'),(42,31,1,'Onions',NULL,'Fresh white onions',25.00,'kg',134,1,'[\"https://5.imimg.com/data5/TP/LC/MY-36452297/fresh-white-onions-500x500.png\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-23 14:45:14'),(43,32,2,'Mangoes',NULL,'Sweet Alphonso mangoes',120.00,'kg',38,1,'[\"https://media.istockphoto.com/id/463651383/photo/mangoes-composition.jpg?s=612x612&w=0&k=20&c=Y96f43HrgKG247uCO1w5OiJSiq2ACoLgdFd3kMwIuvY=\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-23 14:45:14'),(44,32,3,'Basmati Rice',NULL,'Premium quality basmati rice',80.00,'kg',194,1,'[\"https://www.shutterstock.com/image-photo/long-rice-burlap-sack-wooden-600nw-1745499011.jpg\", \"https://t4.ftcdn.net/jpg/02/35/32/19/360_F_235321906_t81XcaHfAAcOIi8dxg1c8s3LZkN3a22J.jpg\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-23 14:45:14'),(45,33,4,'Fresh Milk',NULL,'Pure cow milk',60.00,'liter',68,1,'[\"https://tiimg.tistatic.com/fp/1/006/751/100-pure-cow-milk-793.jpg\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-23 14:45:14'),(46,33,5,'Black Pepper',NULL,'Freshly ground black pepper',200.00,'kg',25,1,'[\"https://cpimg.tistatic.com/7328747/b/1/black-pepper-kali-mirch-.jpg\"]','active',NULL,NULL,'2025-09-08 14:50:32','2025-09-08 15:15:41'),(47,32,8,'broccoli',NULL,'',22.00,'kg',14,1,NULL,'active',NULL,NULL,'2025-09-09 14:51:55','2025-09-23 14:45:14');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('farmer','buyer','admin','logistics') NOT NULL,
  `status` enum('pending','active','suspended','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Rajesh Kumar Sharma','admin.rajesh@agrimarket.in','+91-98765-43210','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','active','2025-09-03 14:57:54','2025-09-22 14:43:34'),(2,'Priya Patel','admin.priya@agrimarket.in','+91-87654-32109','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','active','2025-09-03 14:57:54','2025-09-03 14:57:54'),(3,'Amit Singh','admin.amit@agrimarket.in','+91-76543-21098','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','active','2025-09-03 14:57:54','2025-09-03 14:57:54'),(4,'Lakshmi Devi','farmer.lakshmi@email.com','+91-98765-12345','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(5,'Ramesh Chandra','farmer.ramesh@email.com','+91-87654-23456','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(6,'Sunita Kumari','farmer.sunita@email.com','+91-76543-34567','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(7,'Harish Patel','farmer.harish@email.com','+91-65432-45678','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(8,'Meera Bai','farmer.meera@email.com','+91-54321-56789','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(9,'Ganesh Iyer','farmer.ganesh@email.com','+91-43210-67890','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(10,'Kavita Reddy','farmer.kavita@email.com','+91-32109-78901','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(11,'Suresh Kumar','farmer.suresh@email.com','+91-21098-89012','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 14:57:57','2025-09-03 14:57:57'),(28,'Admin User','admin@kisan.local','9999999999','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','active','2025-09-03 15:04:38','2025-09-09 14:48:44'),(29,'Logistics User','logistics@kisan.local','8888888888','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','logistics','active','2025-09-03 15:04:41','2025-09-22 16:51:09'),(30,'Madhanraj','buyer@test.local','7777777777','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','buyer','active','2025-09-03 15:04:44','2025-09-08 14:37:25'),(31,'Test Farmer','farmer@test.local','6666666666','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 15:04:47','2025-09-09 14:50:16'),(32,'Rajesh Kumar','rajesh@farmer.local','9876543210','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','pending','2025-09-03 15:04:51','2025-09-03 15:04:51'),(33,'Priya Singh','priya@farmer.local','9876543211','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 15:04:51','2025-09-22 14:45:13'),(34,'Amit Patel','amit@farmer.local','9876543212','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 15:04:51','2025-09-03 15:04:51'),(35,'Sunita Devi','sunita@farmer.local','9876543213','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','active','2025-09-03 15:04:51','2025-09-03 15:04:51'),(36,'Rahul Sharma','rahul@buyer.local','8765432109','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','buyer','active','2025-09-03 15:04:54','2025-09-03 15:04:54'),(37,'Neha Gupta','neha@buyer.local','8765432108','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','buyer','active','2025-09-03 15:04:54','2025-09-03 15:04:54'),(38,'Vikram Singh','vikram@buyer.local','8765432107','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','buyer','active','2025-09-03 15:04:54','2025-09-03 15:04:54'),(39,'FastTrack Logistics','fasttrack@logistics.local','7654321098','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','logistics','active','2025-09-03 15:04:58','2025-09-03 15:04:58'),(40,'QuickShip Express','quickship@logistics.local','7654321097','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','logistics','active','2025-09-03 15:04:58','2025-09-03 15:04:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES (2,38,41,'2025-09-22 17:47:43');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-25 20:03:08
