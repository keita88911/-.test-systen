/*
Navicat MySQL Data Transfer

Source Server         : OA
Source Server Version : 50718
Source Host           : 119.23.12.94 :3306
Source Database       : testData

Target Server Type    : MYSQL
Target Server Version : 50718
File Encoding         : 65001

Date: 2018-12-12 17:16:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `account`
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `account_id` int(20) NOT NULL AUTO_INCREMENT,
  `account_name` varchar(50) NOT NULL,
  `accout_password` varchar(50) DEFAULT NULL,
  `accoun_beTime` datetime DEFAULT NULL COMMENT '账户开始时间',
  `accout_endTime` datetime DEFAULT NULL COMMENT '账户失效时间',
  PRIMARY KEY (`account_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of account
-- ----------------------------
INSERT INTO `account` VALUES ('1', '王大', '1234567', null, null);
INSERT INTO `account` VALUES ('2', '王小 ', '12345689', null, null);
INSERT INTO `account` VALUES ('3', '小刚', '123456766', null, null);
INSERT INTO `account` VALUES ('4', '小红', '1234567', null, null);

-- ----------------------------
-- Table structure for `auth_group`
-- ----------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_group_permissions`
-- ----------------------------
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_permission`
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_permission
-- ----------------------------
INSERT INTO `auth_permission` VALUES ('1', 'Can add log entry', '1', 'add_logentry');
INSERT INTO `auth_permission` VALUES ('2', 'Can change log entry', '1', 'change_logentry');
INSERT INTO `auth_permission` VALUES ('3', 'Can delete log entry', '1', 'delete_logentry');
INSERT INTO `auth_permission` VALUES ('4', 'Can add group', '2', 'add_group');
INSERT INTO `auth_permission` VALUES ('5', 'Can change group', '2', 'change_group');
INSERT INTO `auth_permission` VALUES ('6', 'Can delete group', '2', 'delete_group');
INSERT INTO `auth_permission` VALUES ('7', 'Can add permission', '3', 'add_permission');
INSERT INTO `auth_permission` VALUES ('8', 'Can change permission', '3', 'change_permission');
INSERT INTO `auth_permission` VALUES ('9', 'Can delete permission', '3', 'delete_permission');
INSERT INTO `auth_permission` VALUES ('10', 'Can add user', '4', 'add_user');
INSERT INTO `auth_permission` VALUES ('11', 'Can change user', '4', 'change_user');
INSERT INTO `auth_permission` VALUES ('12', 'Can delete user', '4', 'delete_user');
INSERT INTO `auth_permission` VALUES ('13', 'Can add content type', '5', 'add_contenttype');
INSERT INTO `auth_permission` VALUES ('14', 'Can change content type', '5', 'change_contenttype');
INSERT INTO `auth_permission` VALUES ('15', 'Can delete content type', '5', 'delete_contenttype');
INSERT INTO `auth_permission` VALUES ('16', 'Can add session', '6', 'add_session');
INSERT INTO `auth_permission` VALUES ('17', 'Can change session', '6', 'change_session');
INSERT INTO `auth_permission` VALUES ('18', 'Can delete session', '6', 'delete_session');

-- ----------------------------
-- Table structure for `auth_user`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_user_groups`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_groups`;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_groups
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_user_user_permissions`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_user_permissions`;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_user_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for `borrow_phone`
-- ----------------------------
DROP TABLE IF EXISTS `borrow_phone`;
CREATE TABLE `borrow_phone` (
  `id` int(111) NOT NULL AUTO_INCREMENT,
  `phonename` varchar(60) NOT NULL COMMENT '手机名',
  `phonecode` varchar(60) NOT NULL COMMENT '手机编码',
  `state` varchar(10) NOT NULL COMMENT '借出状态\r1:空闲2:借出\r\n',
  `borrowname` varchar(20) DEFAULT NULL COMMENT '借出人',
  `returnname` varchar(20) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  `phonemark` varchar(100) DEFAULT NULL,
  `updatetime` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of borrow_phone
-- ----------------------------
INSERT INTO `borrow_phone` VALUES ('1', 'iphone 6', 'gs-xx11', '1', '--', 'wanglei', '2018-12-12 15:36:02', '--', '2018-12-12 15:36:02');
INSERT INTO `borrow_phone` VALUES ('2', 'qeqwe', 'qwe111', '1', '--', '测试', '2018-12-12 16:05:01', '--', '2018-12-12 16:05:01');
INSERT INTO `borrow_phone` VALUES ('4', '123123', '123123', '1', '--', '测试', '2018-12-12 16:56:47', '--', '2018-12-12 16:56:47');
INSERT INTO `borrow_phone` VALUES ('7', '不得了', '12345479849415', '1', '--', '--', '2018-12-12 11:41:12', '--', null);
INSERT INTO `borrow_phone` VALUES ('8', 'fgbv', 'erfgvserf001', '1', '--', '测试', '2018-12-12 16:14:20', '--', '2018-12-12 16:14:20');
INSERT INTO `borrow_phone` VALUES ('9', 'iphone8', '201800011023', '2', 'wanglei', '--', '2018-12-12 15:49:46', '大神人法网问题提问台湾人听闻提问题问问问题问题我让他我', '2018-12-12 15:49:46');
INSERT INTO `borrow_phone` VALUES ('10', 'iphone8', '1132332320000012154', '2', 'wanglei', '--', '2018-12-12 16:02:27', '--', '2018-12-12 16:02:27');
INSERT INTO `borrow_phone` VALUES ('11', 'iphone8', '23423423423423432', '2', 'wanglei', '--', '2018-12-12 16:02:08', '--', '2018-12-12 16:02:08');

-- ----------------------------
-- Table structure for `django_admin_log`
-- ----------------------------
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_admin_log
-- ----------------------------

-- ----------------------------
-- Table structure for `django_content_type`
-- ----------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_content_type
-- ----------------------------
INSERT INTO `django_content_type` VALUES ('1', 'admin', 'logentry');
INSERT INTO `django_content_type` VALUES ('2', 'auth', 'group');
INSERT INTO `django_content_type` VALUES ('3', 'auth', 'permission');
INSERT INTO `django_content_type` VALUES ('4', 'auth', 'user');
INSERT INTO `django_content_type` VALUES ('5', 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` VALUES ('6', 'sessions', 'session');

-- ----------------------------
-- Table structure for `django_migrations`
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_migrations
-- ----------------------------
INSERT INTO `django_migrations` VALUES ('1', 'contenttypes', '0001_initial', '2018-11-24 02:35:43.729000');
INSERT INTO `django_migrations` VALUES ('2', 'auth', '0001_initial', '2018-11-24 02:35:46.183000');
INSERT INTO `django_migrations` VALUES ('3', 'admin', '0001_initial', '2018-11-24 02:35:46.956000');
INSERT INTO `django_migrations` VALUES ('4', 'admin', '0002_logentry_remove_auto_add', '2018-11-24 02:35:47.144000');
INSERT INTO `django_migrations` VALUES ('5', 'contenttypes', '0002_remove_content_type_name', '2018-11-24 02:35:47.614000');
INSERT INTO `django_migrations` VALUES ('6', 'auth', '0002_alter_permission_name_max_length', '2018-11-24 02:35:47.916000');
INSERT INTO `django_migrations` VALUES ('7', 'auth', '0003_alter_user_email_max_length', '2018-11-24 02:35:48.214000');
INSERT INTO `django_migrations` VALUES ('8', 'auth', '0004_alter_user_username_opts', '2018-11-24 02:35:48.402000');
INSERT INTO `django_migrations` VALUES ('9', 'auth', '0005_alter_user_last_login_null', '2018-11-24 02:35:48.671000');
INSERT INTO `django_migrations` VALUES ('10', 'auth', '0006_require_contenttypes_0002', '2018-11-24 02:35:48.854000');
INSERT INTO `django_migrations` VALUES ('11', 'auth', '0007_alter_validators_add_error_messages', '2018-11-24 02:35:49.037000');
INSERT INTO `django_migrations` VALUES ('12', 'auth', '0008_alter_user_username_max_length', '2018-11-24 02:35:49.328000');
INSERT INTO `django_migrations` VALUES ('13', 'sessions', '0001_initial', '2018-11-24 02:35:49.744000');

-- ----------------------------
-- Table structure for `django_session`
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_session
-- ----------------------------
INSERT INTO `django_session` VALUES ('77l6or5aciw5mk1kbm01cbvgmtujwlbv', 'MWNlY2YzMzUxODgxNThiMGRkNzRkYmVhZGIwZmZlZjQyMTdhMTY4Nzp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3LCJyZXBvcnRpZCI6Ijg3In0=', '2018-12-26 03:52:53.580000');
INSERT INTO `django_session` VALUES ('8x71cs95z8e8jh7xbpo2c1s5c14d1ful', 'ZGIzNGEzMDg1NjIzNWJhYWIwZTA1MDgxNGNhOTdlOTZiYTBjZThjNjp7InVzZXJuYW1lIjoiMTExIiwidXNlcmlkX3BlcnNvbiI6IjEiLCJyb2xlaWQiOiIxIiwidXNlcmlkIjozNywicmVwb3J0aWQiOiI3OSIsInBvc3R0b2tlbiI6InllcyJ9', '2018-12-26 06:39:22.312000');
INSERT INTO `django_session` VALUES ('9xhuutgu89bkeclbhbu53vzovrxefkgb', 'MzEzMGZkMjY2Yzc3MDg0NDNiNzM5Mjk1ZTNmZmU3ODE5NDA4OGYyOTp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3LCJwb3N0dG9rZW4iOiJ5ZXMifQ==', '2018-12-26 06:42:20.598000');
INSERT INTO `django_session` VALUES ('adr3lq172lv17hmpf9q0trf9jiu4nhkl', 'YTljMWY2MGY0NDY5NjA1ZDA0MmZjZGQ3NmQwNGMxMzJlYzBiNzU0NTp7InVzZXJuYW1lIjoiMjIyIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6OTgsInVzZXJpZF9wZXJzb24iOiI5OCJ9', '2018-12-26 06:34:00.095000');
INSERT INTO `django_session` VALUES ('c2dlk7fxnye7lupnrds7p38g4zs23nrc', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 03:50:30.302000');
INSERT INTO `django_session` VALUES ('easp0qpr0mv9ntiksahop9oir20nlkkz', 'NDRkMjFmZmFkNGIwYTJiNTE1YjFmOGM5ZmNlMTFhODA1MmNkNTE4Yzp7InVzZXJuYW1lIjoiXHU2ZDRiXHU4YmQ1Iiwicm9sZWlkIjoiMiIsInVzZXJpZCI6MTA0LCJyZXBvcnRpZCI6Ijk3IiwidXNlcmlkX3BlcnNvbiI6Ijk3In0=', '2018-12-26 08:55:04.703000');
INSERT INTO `django_session` VALUES ('ecm1ylqiypaye7ag4cbrj6zl7ofk3cs5', 'MDM1YzdkYzRjODY4NWViNzMwNDEwNGRhMTM4MDgxZTM3YzdmZjgyYzp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3LCJyZXBvcnRpZCI6Ijk1In0=', '2018-12-26 07:41:40.082000');
INSERT INTO `django_session` VALUES ('gzsyir5eb8ppzm3ivmjtc8z7habp4duo', 'ODAyYWI5ZWJmZWQ5ZThlYWE0YTE2YTQyNWFkYzUxZDcyYTM4ZGNkNTp7InVzZXJuYW1lIjoiMTExIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6MzcsInVzZXJpZF9wZXJzb24iOiI4NyJ9', '2018-12-24 13:29:40.503000');
INSERT INTO `django_session` VALUES ('itt62ukugfisdl5gg01vau0yp15vwt8p', 'Y2RlNzdhYmNkNmY0NTJlNjZkZjJjMTQ0MWQxNTA5NDQwYzU4NGVlMjp7InVzZXJuYW1lIjoiNTUiLCJyb2xlaWQiOiIyIiwidXNlcmlkIjoxMDJ9', '2018-12-26 08:51:39.855000');
INSERT INTO `django_session` VALUES ('ix8castyhp4klmxt9oo1mc8021gro24c', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 03:51:21.521000');
INSERT INTO `django_session` VALUES ('ixb5ptodoso9aqdl0dclrv44uwg3za40', 'NzdiYTY2NzdjMjBmMTVmNGY3NjgxYTg5NzVhZDU2MTYwYWNkMDQ1Yjp7InVzZXJuYW1lIjoiMTExIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6MzcsInBvc3R0b2tlbiI6InllcyJ9', '2018-12-24 12:11:45.357000');
INSERT INTO `django_session` VALUES ('len9kqxsh04hdjlrgj299jkh1luisdg2', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:42:22.123000');
INSERT INTO `django_session` VALUES ('lyjhhpn0di9n97jq9addffevxdvf33hv', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 05:37:44.357000');
INSERT INTO `django_session` VALUES ('oa9mevpqjkqoq3efyjh1vz414h8k7szu', 'ZGYyZjEwMDQwMzM2ODI3MjNiZjFmZDA4NzYwMzQxZGE3MWFhNTdhZDp7InVzZXJuYW1lIjoiMTExIiwidXNlcmlkX3BlcnNvbiI6IjQwIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6MzcsInJlcG9ydGlkIjoiNTIiLCJ3cSI6IjExMSIsInVzZXJpZC1wZXJzb24iOiIzOSJ9', '2018-12-21 09:42:15.064000');
INSERT INTO `django_session` VALUES ('oqaej9k2ctqf1sx1qqf1qe4194pw80s1', 'OWEwMjcyNWRhNjliNTg0Yzc2YTI1NTEwMWM3NDkzMjdkMjMwN2JmZDp7InVzZXJuYW1lIjoiMjIyIiwicm9sZWlkIjoiMiIsInVzZXJpZCI6NDIsInVzZXJpZF9wZXJzb24iOiI0MiJ9', '2018-12-16 06:35:21.007000');
INSERT INTO `django_session` VALUES ('p4rirtryefwvm05z0a3lhlubjcc2a6a9', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:31:45.898000');
INSERT INTO `django_session` VALUES ('q2srdqqulm9r1r01kyjmxpm53ffg9haz', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:56:21.613000');
INSERT INTO `django_session` VALUES ('qgf9bo5ghdr9p2adamh27j6mwg3mb9mq', 'ZGY2ZDk3OWJmOTBlMzcxMzQ4ZWNhMDc3YjVjODgxOGEzZTMzODQ3Yjp7InVzZXJuYW1lIjoiMTExIiwidXNlcmlkX3BlcnNvbiI6IjM3Iiwicm9sZWlkIjoiMSIsInVzZXJpZCI6MzcsInJlcG9ydGlkIjoiODAifQ==', '2018-12-26 06:07:57.913000');
INSERT INTO `django_session` VALUES ('r4apfeafnc27bw6lh07wpgpzt2gb11jm', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:18:06.067000');
INSERT INTO `django_session` VALUES ('rdwan2ix7n6uq8lokjfqd73otdfez2bo', 'MWJjZGVkZjE5ODRhODA1MGI2Mjg5ODZhYzZkZWFhNDk2NjgwNzYxNTp7InVzZXJuYW1lIjoiMjIyIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6NDMsInJlcG9ydGlkIjoiNTMifQ==', '2018-12-16 09:35:45.886000');
INSERT INTO `django_session` VALUES ('ttwmfvcy57fwt4ydlp9jomflwfle7qhf', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:17:52.483000');
INSERT INTO `django_session` VALUES ('uz9aflvrv4i7l1pjtskn4iqe55ntcpus', 'YjJjNWEwZjZmMGNjZWI0YjBiZjVmY2ZjOGFlYjlhZjhlMDU5ZmI1Njp7InVzZXJuYW1lIjoidGVzdCIsInJvbGVpZCI6IjEiLCJ1c2VyaWQiOjk3fQ==', '2018-12-26 06:18:03.899000');
INSERT INTO `django_session` VALUES ('x5zqdvz3zqnzlihrgnw7atmnwkwmrwkz', 'YzVjZThiZGUxNWJlNTU5ODU1OTQxZmFiMDk4N2Y4YTE0YzAzYmFkNzp7InVzZXJpZCI6MzcsIndxIjoiMTExIn0=', '2018-12-13 15:30:15.244000');
INSERT INTO `django_session` VALUES ('y3yf0n3gixz0r4rjucgfz08dy00lr3ll', 'NTljODkwNmFlY2NmYWZmMmMwOTI4MzBhZDUxYWRiYzBlMDAwNjNjYTp7InVzZXJuYW1lIjoiMTExIiwicm9sZWlkIjoiMSIsInVzZXJpZCI6MzcsInVzZXJpZF9wZXJzb24iOiIzOCJ9', '2018-12-25 09:35:12.155000');

-- ----------------------------
-- Table structure for `role`
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleName` varchar(20) NOT NULL,
  `roleId` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', '管理员', '1');
INSERT INTO `role` VALUES ('2', '普通人员', '2');

-- ----------------------------
-- Table structure for `TET`
-- ----------------------------
DROP TABLE IF EXISTS `TET`;
CREATE TABLE `TET` (
  `ID` int(11) NOT NULL,
  `pass` varchar(30) NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of TET
-- ----------------------------
INSERT INTO `TET` VALUES ('1', '222', '王大');
INSERT INTO `TET` VALUES ('2', '222', '王小');
INSERT INTO `TET` VALUES ('3', '333', '网一');

-- ----------------------------
-- Table structure for `TET_copy`
-- ----------------------------
DROP TABLE IF EXISTS `TET_copy`;
CREATE TABLE `TET_copy` (
  `ID` int(11) NOT NULL,
  `pass` varchar(30) NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of TET_copy
-- ----------------------------
INSERT INTO `TET_copy` VALUES ('1', '222', '王大');
INSERT INTO `TET_copy` VALUES ('2', '222', '王小');
INSERT INTO `TET_copy` VALUES ('3', '333', '网一');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `roleId` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', '测试人员', '123', '1');
INSERT INTO `user` VALUES ('97', 'wanglei', '123456', '1');
INSERT INTO `user` VALUES ('102', '55', '555', '2');
INSERT INTO `user` VALUES ('103', '请问', '111', '1');
INSERT INTO `user` VALUES ('104', '测试', '123456', '2');
INSERT INTO `user` VALUES ('105', '111', '111', '1');

-- ----------------------------
-- Table structure for `week-report`
-- ----------------------------
DROP TABLE IF EXISTS `week-report`;
CREATE TABLE `week-report` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `username` varchar(20) NOT NULL,
  `userid` varchar(1000) NOT NULL,
  `text` varchar(2000) NOT NULL,
  `createData` datetime DEFAULT NULL,
  `updata` timestamp NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of week-report
-- ----------------------------
INSERT INTO `week-report` VALUES ('1', '9月第一周', 'admin', '2', '书写文档asdasdasd撒大声地我去额群翁群无恶趣味请问请问请问请问请问委屈二是发斯蒂芬说的我业务人员热火以耳环耳环和供热吾儿戊二醛无任务欠人情无若千万人千万人', null, '2018-11-20 11:53:10');
INSERT INTO `week-report` VALUES ('2', 'test', 'admin', '2', 'dasdf111\r\n尾萼蔷薇\r\n恶趣味', null, '2018-11-22 21:21:07');
INSERT INTO `week-report` VALUES ('3', '9月第2周', 'admin', '2', '书写文档asdasdasd撒大声地我去额群翁群无恶趣味请问请问请问请问请问委屈二是发斯蒂芬说的我业务人员热火以耳环耳环和供热吾儿戊二醛无任务欠人情无若千万人千万人', null, '2018-11-20 11:53:10');
INSERT INTO `week-report` VALUES ('4', '10月第1周', 'admin', '2', '书写文档asdasd', null, '2018-11-20 11:53:10');
INSERT INTO `week-report` VALUES ('5', '10月第3周', 'admin', '2', '书写文档asdasd', null, '2018-11-21 17:16:15');
INSERT INTO `week-report` VALUES ('6', '10月第4周', 'admin', '2', '书写文档asdasd', null, '2018-11-21 17:16:18');
INSERT INTO `week-report` VALUES ('7', 'xljipo', 'admin', '2', 'this is test', null, null);
INSERT INTO `week-report` VALUES ('8', '11月第4周', 'admin', '2', '书写文档asdasd', null, '2018-11-21 17:16:20');
INSERT INTO `week-report` VALUES ('19', 'xljipo2', 'admin', '2', 'this is test', null, null);
INSERT INTO `week-report` VALUES ('22', 'xljipo3', 'admin', '2', 'this is test', null, null);
INSERT INTO `week-report` VALUES ('23', '驱蚊器翁', 'admin', '2', '驱蚊器翁去翁', null, '2018-11-21 17:16:23');
INSERT INTO `week-report` VALUES ('24', '尾萼蔷薇', 'test', '1', '请问请问', null, '2018-11-21 17:16:25');
INSERT INTO `week-report` VALUES ('25', '撒大大', 'admin', '2', '达到阿萨德阿萨德阿萨德阿杜\r\n是是是', null, '2018-11-23 13:50:35');
INSERT INTO `week-report` VALUES ('26', '23请问', 'admin', '2', '1.请问驱蚊器翁请问请问\r\n2。请问驱蚊器翁请问q\r\n3我打算的阿萨德', null, '2018-11-21 17:16:31');
INSERT INTO `week-report` VALUES ('27', '尾萼蔷薇', 'admin', '2', '请问企鹅人', null, '2018-11-21 17:16:41');
INSERT INTO `week-report` VALUES ('28', '123123', 'admin', '2', '切尔奇翁', '2018-11-21 17:18:28', '2018-11-21 17:18:28');
INSERT INTO `week-report` VALUES ('29', '123123', 'admin', '2', '切尔奇翁\r\n', '2018-11-21 17:18:31', '2018-11-21 17:18:31');
INSERT INTO `week-report` VALUES ('30', '二人不对', 'admin', '2', '问我请问\r\n奥术大师驱蚊器\r\n给他人', '2018-11-21 17:20:12', '2018-11-23 10:19:52');
INSERT INTO `week-report` VALUES ('31', '大叔大婶', 'admin', '2', '啊发顺丰\r\n啊撒大声地\r\n阿萨德按时', '2018-11-22 13:56:51', '2018-11-22 13:56:51');
INSERT INTO `week-report` VALUES ('32', '大叔大婶11', 'admin', '2', '啊发顺丰\r\n啊撒大声地\r\n阿萨德按时111\r\n', '2018-11-22 16:10:39', '2018-11-22 16:10:39');
INSERT INTO `week-report` VALUES ('33', '大叔大婶11', 'admin', '2', '\r\n', '2018-11-22 16:10:49', '2018-11-22 16:10:49');
INSERT INTO `week-report` VALUES ('34', '大叔大婶11', 'admin', '2', '\r\n123123', '2018-11-22 16:10:56', '2018-11-22 16:10:56');
INSERT INTO `week-report` VALUES ('35', '大叔大婶11', 'admin', '2', '123123\r\n', '2018-11-22 16:11:21', '2018-11-22 16:11:21');
INSERT INTO `week-report` VALUES ('36', '大叔大婶11', 'admin', '2', '123123\r\n\r\n', '2018-11-22 16:11:49', '2018-11-22 16:11:49');
INSERT INTO `week-report` VALUES ('37', '大叔大婶11', 'admin', '2', '123123\r\n\r\n\r\n', '2018-11-22 16:13:04', '2018-11-22 16:13:04');
INSERT INTO `week-report` VALUES ('38', '大叔大婶11', 'admin', '2', '123123\r\n\r\n\r\n\r\n', '2018-11-22 16:13:32', '2018-11-22 16:13:32');
INSERT INTO `week-report` VALUES ('39', '大叔大婶11', 'admin', '2', '123123\r\n\r\n\r\n\r\n\r\n', '2018-11-22 16:13:40', '2018-11-22 16:13:40');
INSERT INTO `week-report` VALUES ('40', '大叔大婶11', 'admin', '2', '123123\r\n\r\n\r\n\r\n\r\n', '2018-11-22 16:14:07', '2018-11-22 16:14:07');
INSERT INTO `week-report` VALUES ('41', '大叔大婶11', 'admin', '2', '123123\r\n\r\n\r\n\r\n\r\n\r\n', '2018-11-22 16:17:20', '2018-11-22 16:17:20');
INSERT INTO `week-report` VALUES ('42', '大叔大婶1122', 'admin', '2', '123123\r\n\r\n3333\r\n\r\n\r\n\r\n\r\n\r\n\r\n说的的撒的阿萨德\r\n阿萨德阿萨德loanerName	loanerCardId	newcar	mobile\r\n测试邓劼1	412824198305298901	0	18555555555\r\n测试邓劼2	130603198311057344	0	18555555555\r\n测试邓劼3	130103198412297489	0	18555555555\r\n测试邓劼4	640111199902164843	0	18555555555\r\n测试邓劼5	441401197702032959	0	18555555555\r\n			\r\n			\r\n			\r\n', '2018-11-22 16:34:57', '2018-11-22 17:19:58');
INSERT INTO `week-report` VALUES ('43', '123', 'admin', '2', '123', '2018-11-23 14:13:37', '2018-11-23 14:13:37');
INSERT INTO `week-report` VALUES ('44', '而我却二', 'admin', '2', '请问', '2018-11-23 14:15:13', '2018-11-23 14:15:13');
INSERT INTO `week-report` VALUES ('45', '而我却二', 'admin', '2', '请问\r\n', '2018-11-23 14:15:16', '2018-11-23 14:15:16');
INSERT INTO `week-report` VALUES ('46', '儿', 'admin', '2', '吾儿', '2018-11-23 14:16:50', '2018-11-23 14:16:50');
INSERT INTO `week-report` VALUES ('47', '请问', 'admin', '2', '请问亲亲我', '2018-11-23 14:17:56', '2018-11-23 14:17:56');
INSERT INTO `week-report` VALUES ('48', '额请问', 'admin', '2', '切切', '2018-11-23 14:18:45', '2018-11-23 14:18:45');
INSERT INTO `week-report` VALUES ('49', '他热让他', 'admin', '2', 'ter他\r\n', '2018-11-23 14:19:57', '2018-11-23 14:20:33');
INSERT INTO `week-report` VALUES ('50', '11月第4周', 'admin', '2', '\'而我却请问@！#！@#@！#@！！@#!@#!@$!@$!@$!@;p[p[\'', '2018-11-23 14:33:51', '2018-11-20 11:53:10');
INSERT INTO `week-report` VALUES ('51', '11月第4周', 'admin', '2', '/而我却请问@！#！@#@！#@！！@#!@#!@$!@$!@$!@;p[p[/', '2018-11-23 14:43:34', '2018-11-20 11:53:10');
INSERT INTO `week-report` VALUES ('52', '11周22', 'admin', '2', '：“”：L\":L|<>?<?<>?<>?<>}?{<>?}{<>?}<{}#!@#!@#!@%^&*<>?><?|<>\"?<>|\"?<>?|\"<>?}{}./.\\\';\'\\[p[]]123123@!&#*%@!^&%$@&!(%$)@!^$)@!^)*#&@*#(&@!(#(!@_3', '2018-11-23 14:47:11', '2018-11-23 14:53:53');
INSERT INTO `week-report` VALUES ('53', '123123444按时发生', '测试账号', '3', '123123\r\n\r\nas打算asdas达到asd', '2018-11-26 15:55:09', '2018-12-02 14:45:27');
INSERT INTO `week-report` VALUES ('54', '而威尔wer', '111', '37', 'werwerwer', '2018-12-02 14:45:50', '2018-12-02 14:45:50');
INSERT INTO `week-report` VALUES ('55', '【功能-IOS】业务订单-编辑订单，重新上传照片信息，APP闪退', '111', '37', '驱蚊器翁请问请问请问请问', '2018-12-03 15:55:29', '2018-12-03 15:55:29');
INSERT INTO `week-report` VALUES ('56', '大叔大婶11', '111', '37', '尾萼蔷薇群翁请问请问委屈二', '2018-12-03 15:56:20', '2018-12-03 15:56:20');
INSERT INTO `week-report` VALUES ('57', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:32', '2018-12-03 15:56:32');
INSERT INTO `week-report` VALUES ('58', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:32', '2018-12-03 15:56:32');
INSERT INTO `week-report` VALUES ('59', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:32', '2018-12-03 15:56:32');
INSERT INTO `week-report` VALUES ('60', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:32', '2018-12-03 15:56:32');
INSERT INTO `week-report` VALUES ('61', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:33', '2018-12-03 15:56:33');
INSERT INTO `week-report` VALUES ('62', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:33', '2018-12-03 15:56:33');
INSERT INTO `week-report` VALUES ('63', '23123123213', '111', '37', '1231231', '2018-12-03 15:56:33', '2018-12-03 15:56:33');
INSERT INTO `week-report` VALUES ('64', '222', '111', '37', '2222', '2018-12-03 16:24:02', '2018-12-03 16:24:02');
INSERT INTO `week-report` VALUES ('65', '222', '111', '37', '2222', '2018-12-03 16:24:02', '2018-12-03 16:24:02');
INSERT INTO `week-report` VALUES ('66', '331', '111', '37', '112', '2018-12-03 16:26:00', '2018-12-03 16:26:00');
INSERT INTO `week-report` VALUES ('67', '23123', '111', '37', '123123123', '2018-12-03 16:26:32', '2018-12-03 16:26:32');
INSERT INTO `week-report` VALUES ('68', '23123', '111', '37', '123123123', '2018-12-03 16:26:32', '2018-12-03 16:26:32');
INSERT INTO `week-report` VALUES ('69', '23123', '111', '37', '123123123', '2018-12-03 16:26:32', '2018-12-03 16:26:32');
INSERT INTO `week-report` VALUES ('70', '23123', '111', '37', '123123123', '2018-12-03 16:26:32', '2018-12-03 16:26:32');
INSERT INTO `week-report` VALUES ('71', '23123', '111', '37', '123123123', '2018-12-03 16:26:33', '2018-12-03 16:26:33');
INSERT INTO `week-report` VALUES ('72', '123', '111', '37', '123123', '2018-12-03 16:27:39', '2018-12-03 16:27:39');
INSERT INTO `week-report` VALUES ('73', '123333', '111', '37', '123123\r\n333', '2018-12-03 16:27:39', '2018-12-03 16:36:05');
INSERT INTO `week-report` VALUES ('74', '驱蚊器', '111', '37', '请问去', '2018-12-03 16:27:51', '2018-12-03 16:27:51');
INSERT INTO `week-report` VALUES ('75', '我去额群 ', '111', '37', '123123', '2018-12-04 08:48:12', '2018-12-04 08:48:12');
INSERT INTO `week-report` VALUES ('76', '123123123123驱蚊器', '111', '37', '1414', '2018-12-04 08:53:46', '2018-12-04 08:53:46');
INSERT INTO `week-report` VALUES ('77', '恶趣味', '111', '37', '请问', '2018-12-04 08:54:06', '2018-12-04 08:54:06');
INSERT INTO `week-report` VALUES ('78', '23123', '111', '37', '1231', '2018-12-04 08:56:50', '2018-12-04 08:56:50');
INSERT INTO `week-report` VALUES ('79', '委屈二qe', '111', '37', '请问恶趣味恶趣味', '2018-12-04 08:57:06', '2018-12-04 08:57:06');
INSERT INTO `week-report` VALUES ('80', '委屈二qe', '111', '37', '请问恶趣味恶趣味\r\n12213', '2018-12-04 08:57:06', '2018-12-12 12:49:28');
INSERT INTO `week-report` VALUES ('81', '1233', '111', '37', '123123', '2018-12-04 09:01:54', '2018-12-04 09:01:54');
INSERT INTO `week-report` VALUES ('82', '123123', '111', '37', '123123', '2018-12-04 09:09:20', '2018-12-04 09:09:20');
INSERT INTO `week-report` VALUES ('83', '12412', '111', '37', '4124124', '2018-12-04 09:09:34', '2018-12-04 09:09:34');
INSERT INTO `week-report` VALUES ('84', '恶趣味群翁请问', '111', '37', 'as打算as大萨达as的adasdad啊啊\r\nadasdas打ad\r\nasdasdasdasdasd\r\nasdasdasdasdaasdasd\r\nasdasdasdas\r\nas大萨达asd\r\n123@！#！@#！@\r\n02139-012831=2038\r\n快给我【假发【wpoejk\r\n12113123123\r\n', '2018-12-05 20:16:42', '2018-12-05 20:16:42');
INSERT INTO `week-report` VALUES ('85', '111', '111', '37', '42412414', '2018-12-06 11:07:37', '2018-12-06 11:07:37');
INSERT INTO `week-report` VALUES ('86', '额阿大声道as', '111', '37', '213123 ', '2018-12-10 21:28:23', '2018-12-10 21:28:23');
INSERT INTO `week-report` VALUES ('87', '切尔奇翁', '111', '37', '驱蚊器翁去翁去‘’‘。》】’【跑28！@#！#￥#￥…………*（）……&）《》？》《》M>M<>】；', '2018-12-10 21:28:53', '2018-12-10 21:28:53');
INSERT INTO `week-report` VALUES ('90', '123123', '111', '37', '12321', '2018-12-12 13:52:10', '2018-12-12 13:52:10');
INSERT INTO `week-report` VALUES ('91', '123213', '111', '37', '444123123', '2018-12-12 13:57:40', '2018-12-12 13:57:40');
INSERT INTO `week-report` VALUES ('92', '12#！@#！@#！@#！@#', '111', '37', '123！@#@！#！@#！@#', '2018-12-12 14:09:06', '2018-12-12 14:09:06');
INSERT INTO `week-report` VALUES ('93', '123123', 'test', '97', '123123123', '2018-12-12 14:56:05', '2018-12-12 14:56:05');
INSERT INTO `week-report` VALUES ('94', '补充电审资料完成，后台页面领取任务审核时。客户的贷款金额未显示', 'test', '97', '补充电审资料完成，后台页面领取任务审核时。客户的贷款金额未显示', '2018-12-12 15:26:41', '2018-12-12 15:26:41');
INSERT INTO `week-report` VALUES ('95', '倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时倒计时', 'wanglei', '97', '强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作。\r\n\r\n　　二、培育引导创业主体。一是结合乡村振兴战略实施，拓展创业政策扶持范围，将“下乡创业”纳入扶持范围。二是明确提出创业者引进项目、资金和技术的，按当地招商引资相关政策给予优惠和奖励，着重解决部分地方对规模小、投资少的农民工创业项目重视不够、优惠政策差异化的问题。三是明确符合条件创业项目可享受国家惠农和小微企业扶持政策，进一步加强对创业者和创业项目的培育支持。\r\n\r\n　　三、强化基本要素保障。一是用地支持方面，明确了对创业者土地流转达到60亩以上的可给予奖补，其中开展粮食种植30亩以上可按规定享受种粮大户补贴政策；明确了土地出让价的最低标准，进一步支持创业者从事农林牧渔业产品初加工创业；明确对农村新产业新业态新增建设用地按计划总量的8%予以单列，对从事森林康养、休闲农业和乡村旅游等农业经营主体，其辅助设施建设用地可再增加3%，加强了创业用地保障。二是在生产用电上，明确了执行农业生产电价的创业项目范围。三是在培育创业平台，减轻创业成本上，明确对返乡下乡项目入住的创业园区给予资金奖补；鼓励市、县对返乡创业农村电子商务服务平台的场地租金和网络使用费等给予一定比例的补贴。\r\n\r\n\r\n\r\n、强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作。\r\n、强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作、强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作、强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作、强化创业工作责任主体。《通知》明确提出推进返乡下乡创业工作纳入政府的绩效考核，突出县级政府的主体责任。同时要求各级政府要进一步提高推动返乡下乡创业工作的认识，建立政府主要负责人牵头负责、有关部门共同参与的工作机制，研究制定本地区推进返乡下乡创业工作规划，明确政策制度和目标任务，合理安排政策落实和工作推进所需资金，从政府层面引导推进创业工作\r\n\r\n', '2018-12-12 15:32:44', '2018-12-12 15:44:46');
INSERT INTO `week-report` VALUES ('96', '123123', '55', '102', '123123qwe ', '2018-12-12 16:38:27', '2018-12-12 16:38:27');
INSERT INTO `week-report` VALUES ('97', '倒计时', '测试', '104', '幅度萨芬沙发沙发发送', '2018-12-12 16:56:04', '2018-12-12 16:56:04');
