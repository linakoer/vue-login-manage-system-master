/*
 Navicat MySQL Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : login

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 01/12/2024 10:54:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `assignment_score` float NULL DEFAULT 0,
  `lab_report_score` float NULL DEFAULT 0,
  `homework1_score` float NULL DEFAULT 0,
  `homework2_score` float NULL DEFAULT 0,
  `homework3_score` float NULL DEFAULT 0,
  `homework4_score` float NULL DEFAULT 0,
  `final_score` float GENERATED ALWAYS AS (round(((((((`assignment_score` * 0.6) + (`lab_report_score` * 0.1)) + (`homework1_score` * 0.05)) + (`homework2_score` * 0.05)) + (`homework3_score` * 0.1)) + (`homework4_score` * 0.1)),2)) STORED NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `student_id`(`student_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 88 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of students
-- ----------------------------
INSERT INTO `students` VALUES (81, '122', 'c', 90, 53, 45, 80, 85, 80, DEFAULT, '2024-12-18 22:25:23', '2024-12-18 22:25:23');
INSERT INTO `students` VALUES (82, '123', 'd', 80, 60, 55, 70, 70, 70, DEFAULT, '2024-12-18 22:25:23', '2024-12-18 22:25:23');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `account` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `repeatPass` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `card` varchar(19) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `birth` datetime NOT NULL,
  `sex` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`username`) USING BTREE,
  UNIQUE INDEX `username_UNIQUE`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('202316060103', '陈国霖', '1', '1', '1@qq.com', '13511111111', '445224111111111111', '2024-12-01 08:00:00', 'man');
INSERT INTO `user` VALUES ('admin', 'admin', 'admin', '1', '1@qq.com', '13511111111', '445224111111111111', '2024-12-01 08:00:00', 'man');

SET FOREIGN_KEY_CHECKS = 1;
