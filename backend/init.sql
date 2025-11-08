-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: health_management_db
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bodymetrics`
--

DROP TABLE IF EXISTS `bodymetrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bodymetrics` (
  `BodyMetricID` int NOT NULL AUTO_INCREMENT,
  `UserID` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `HeightCM` decimal(5,2) NOT NULL,
  `WeightKG` decimal(5,2) NOT NULL,
  `RecordDate` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`BodyMetricID`),
  UNIQUE KEY `UQ_User_RecordDate` (`UserID`,`RecordDate`),
  KEY `IDX_BodyMetrics_User_Date` (`UserID`,`RecordDate`),
  CONSTRAINT `FK_User_BodyMetrics` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bodymetrics`
--

LOCK TABLES `bodymetrics` WRITE;
/*!40000 ALTER TABLE `bodymetrics` DISABLE KEYS */;
INSERT INTO `bodymetrics` VALUES (1,'4d799e64-a205-4db1-b1f7-25ef0085bfbf',175.50,70.25,'2025-05-25'),(3,'4d799e64-a205-4db1-b1f7-25ef0085bfbf',175.50,75.25,'2025-05-30'),(5,'4d799e64-a205-4db1-b1f7-25ef0085bfbf',175.50,75.25,'2025-05-31'),(6,'4d799e64-a205-4db1-b1f7-25ef0085bfbf',175.60,75.00,'2025-06-01'),(7,'62c6e38e-abf9-4c5c-92de-020a3a423b59',189.00,89.00,'2025-06-10'),(8,'704ec977-fb87-475f-b450-b0b3a39cae59',180.00,80.00,'2025-06-12'),(9,'cfa6b1c4-baac-41a7-9df3-c1d1397483d2',160.00,45.00,'2025-06-13'),(10,'62dd8366-7c6e-4cb3-926c-ed5530bd982b',170.00,65.00,'2025-06-13'),(11,'6cafc838-89c3-46a4-9873-07c400fb237b',170.00,60.00,'2025-06-15'),(13,'704ec977-fb87-475f-b450-b0b3a39cae59',172.00,80.00,'2025-06-01'),(14,'704ec977-fb87-475f-b450-b0b3a39cae59',171.00,71.00,'2025-06-02'),(15,'704ec977-fb87-475f-b450-b0b3a39cae59',172.00,72.00,'2025-06-03'),(16,'704ec977-fb87-475f-b450-b0b3a39cae59',175.00,85.00,'2025-06-04'),(17,'704ec977-fb87-475f-b450-b0b3a39cae59',176.00,74.00,'2025-06-05'),(18,'704ec977-fb87-475f-b450-b0b3a39cae59',176.00,80.00,'2025-06-07'),(19,'704ec977-fb87-475f-b450-b0b3a39cae59',172.00,78.00,'2025-06-08'),(20,'704ec977-fb87-475f-b450-b0b3a39cae59',177.00,91.00,'2025-06-10'),(23,'704ec977-fb87-475f-b450-b0b3a39cae59',181.00,70.00,'2025-06-13'),(25,'704ec977-fb87-475f-b450-b0b3a39cae59',185.00,88.00,'2025-06-17'),(26,'704ec977-fb87-475f-b450-b0b3a39cae59',183.00,84.00,'2025-06-16'),(29,'704ec977-fb87-475f-b450-b0b3a39cae59',172.00,78.00,'2025-05-07'),(30,'704ec977-fb87-475f-b450-b0b3a39cae59',173.00,86.00,'2025-06-18'),(31,'704ec977-fb87-475f-b450-b0b3a39cae59',174.00,80.00,'2025-06-06'),(32,'704ec977-fb87-475f-b450-b0b3a39cae59',173.00,83.00,'2025-06-19');
/*!40000 ALTER TABLE `bodymetrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dietitem`
--

DROP TABLE IF EXISTS `dietitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietitem` (
  `DietItemID` int NOT NULL AUTO_INCREMENT,
  `UserID` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RecordDate` date NOT NULL,
  `FoodName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MealType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `EstimatedCalories` int DEFAULT NULL,
  PRIMARY KEY (`DietItemID`),
  KEY `IDX_DietItem_User_Date` (`UserID`,`RecordDate`),
  CONSTRAINT `FK_Diet_User` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietitem`
--

LOCK TABLES `dietitem` WRITE;
/*!40000 ALTER TABLE `dietitem` DISABLE KEYS */;
INSERT INTO `dietitem` VALUES (1,'4d799e64-a205-4db1-b1f7-25ef0085bfbf','2025-06-07','猪脚饭','午餐',397),(3,'4d799e64-a205-4db1-b1f7-25ef0085bfbf','2025-06-07','猪脚','午餐',300),(4,'a854cd43-ed59-4d11-b530-a6260c6ec94f','2025-06-10','猪脚饭','午餐',1000),(7,'6cafc838-89c3-46a4-9873-07c400fb237b','2025-06-15','黄金帅苹果','晚餐',50),(8,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','苹果','加餐',20),(9,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','香蕉','加餐',20),(10,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','李子','加餐',0),(11,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','青苹果','加餐',0),(12,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','红苹果','加餐',0),(13,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','黄苹果','加餐',0),(14,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','猪杂粉','加餐',1000),(15,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','猪杂粿条','加餐',1000),(16,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','牛杂粉','加餐',1000),(17,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','牛腩粉','加餐',1232),(18,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','泡面','晚餐',100),(19,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','泡面','午餐',2000),(20,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','苹果','加餐',50),(21,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','泡面','早餐',2000),(22,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-19','苹果','加餐',50),(23,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-19','三文鱼','午餐',2000);
/*!40000 ALTER TABLE `dietitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exerciseitem`
--

DROP TABLE IF EXISTS `exerciseitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exerciseitem` (
  `ExerciseItemID` int NOT NULL AUTO_INCREMENT,
  `UserID` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RecordDate` date NOT NULL,
  `ExerciseType` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DurationMinutes` int NOT NULL,
  `EstimatedCaloriesBurned` int DEFAULT NULL,
  PRIMARY KEY (`ExerciseItemID`),
  KEY `IDX_ExerciseItem_User_Date` (`UserID`,`RecordDate`),
  CONSTRAINT `FK_Exercise_User` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exerciseitem`
--

LOCK TABLES `exerciseitem` WRITE;
/*!40000 ALTER TABLE `exerciseitem` DISABLE KEYS */;
INSERT INTO `exerciseitem` VALUES (1,'4d799e64-a205-4db1-b1f7-25ef0085bfbf','2025-06-07','羽毛球',40,399),(2,'4d799e64-a205-4db1-b1f7-25ef0085bfbf','2025-06-07','游泳',60,599),(3,'a854cd43-ed59-4d11-b530-a6260c6ec94f','2025-06-10','跑步',1,1),(4,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','跑步',50,2000),(5,'6cafc838-89c3-46a4-9873-07c400fb237b','2025-06-15','跑步',60,720),(6,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-18','游泳',1,111),(7,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-19','跑步',80,423),(8,'704ec977-fb87-475f-b450-b0b3a39cae59','2025-06-19','瑜伽',45,1000);
/*!40000 ALTER TABLE `exerciseitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Gender` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('22db0caf-8823-4097-9c0b-33f3509f7527','zhong@qq.com','96e79218965eb72c92a549dd5a330112','春哥','男','2020-07-18'),('3543872e-9a1f-4aa5-b0b0-986af5129c47','222@qq.com','25d55ad283aa400af464c76d713c07ad','李四1','女','2025-06-01'),('4d799e64-a205-4db1-b1f7-25ef0085bfbf','user@example.com','e10adc3949ba59abbe56e057f20f883e','小明','男','2000-01-01'),('5be60aec-e19c-4e08-a2a3-f929b6178be0','a@a.com','0b4e7a0e5fe84ad35fb5f95b9ceeac79','aa','男','2025-10-28'),('5d358d3e-ec5f-4733-884a-afadbd981180','test@test.com','96e79218965eb72c92a549dd5a330112','测试','男','2025-06-24'),('62c6e38e-abf9-4c5c-92de-020a3a423b59','man@example.com','12345678','tinyst','男','2004-06-09'),('62dd8366-7c6e-4cb3-926c-ed5530bd982b','q@qq.com','e10adc3949ba59abbe56e057f20f883e','张三丰','男','2010-03-09'),('6cafc838-89c3-46a4-9873-07c400fb237b','1@qq.com','96e79218965eb72c92a549dd5a330112','管理员','男','2025-06-03'),('704ec977-fb87-475f-b450-b0b3a39cae59','3@qq.com','96e79218965eb72c92a549dd5a330112','王四','男','2025-06-15'),('70c2ee9c-6113-476f-a198-10a814cdf7e4','zhangsan@qq.com','96e79218965eb72c92a549dd5a330112','张三','男','2001-06-20'),('a854cd43-ed59-4d11-b530-a6260c6ec94f','111@qq.com','123456','张三','男','2025-06-24'),('cfa6b1c4-baac-41a7-9df3-c1d1397483d2','test@qq.com','96e79218965eb72c92a549dd5a330112','张三丰','女','2011-06-07'),('fb7a1717-cc62-4da0-94aa-361982023708','sztu@qq.com','96e79218965eb72c92a549dd5a330112','老王','男','2025-06-09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-21 22:18:56
