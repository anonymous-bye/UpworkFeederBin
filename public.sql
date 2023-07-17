/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : PostgreSQL
 Source Server Version : 150003 (150003)
 Source Host           : localhost:5432
 Source Catalog        : upwork
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 150003 (150003)
 File Encoding         : 65001

 Date: 18/07/2023 04:39:37
*/


-- ----------------------------
-- Table structure for tbl_account
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_account";
CREATE TABLE "public"."tbl_account" (
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "profile" varchar(255) COLLATE "pg_catalog"."default",
  "state" varchar(255) COLLATE "pg_catalog"."default",
  "connects" int2,
  "rising_talent" varchar(255) COLLATE "pg_catalog"."default",
  "created_date" timestamp(0),
  "last_login_date" timestamp(0),
  "profile_title" varchar(255) COLLATE "pg_catalog"."default",
  "created_ip" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_account
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_application
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_application";
CREATE TABLE "public"."tbl_application" (
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "job_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default",
  "profile" varchar(255) COLLATE "pg_catalog"."default",
  "proposal_json" json,
  "job_title" varchar(255) COLLATE "pg_catalog"."default",
  "state" varchar(255) COLLATE "pg_catalog"."default",
  "created_date" timestamp(0),
  "updated_date" timestamp(0),
  "succeed_date" timestamp(6),
  "channel" int4,
  "priority" int4,
  "job_country" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_application
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_message
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_message";
CREATE TABLE "public"."tbl_message" (
  "id" int4 NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "job_id" varchar(255) COLLATE "pg_catalog"."default",
  "job_title" varchar(255) COLLATE "pg_catalog"."default",
  "client_name" varchar(255) COLLATE "pg_catalog"."default",
  "message_content" varchar(255) COLLATE "pg_catalog"."default",
  "message_link" varchar(255) COLLATE "pg_catalog"."default",
  "received_date" timestamp(0)
)
;

-- ----------------------------
-- Records of tbl_message
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_profile
-- ----------------------------
DROP TABLE IF EXISTS "public"."tbl_profile";
CREATE TABLE "public"."tbl_profile" (
  "id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "symbol" varchar(255) COLLATE "pg_catalog"."default",
  "title" varchar(255) COLLATE "pg_catalog"."default",
  "channel" int4,
  "script_filename" varchar(255) COLLATE "pg_catalog"."default",
  "require_count" int4,
  "min_number" int4,
  "max_number" int4,
  "state" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tbl_profile
-- ----------------------------
INSERT INTO "public"."tbl_profile" VALUES ('frontend', 'A', 'Frntend', 2, 'A-frontend.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('blockchain', 'B', 'Blockchain/Web3', 2, 'B-blockchain.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('blockchain-2', 'C', 'Blockchain 2', 3, 'C-blockchain-2.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('frontend-2', 'F', 'Frontend 2', 3, 'F-frontend-2.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('webflow', 'Q', 'Webflow', 2, 'Q-webflow.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('automation', 'V', 'Automation', 3, 'V-automation.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('webflow-2', 'W', 'Webflow 2', 3, 'W-webflow-2.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('basic', 'Z', 'Auto/Scraping/Bot', 2, 'Z-basic.js', 100, 100, 999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('javascript', '5', 'React, Vue, Node', 2, '5-javascript.js', 1000, 50000, 59999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('wp-django', '2', 'WordPress, Django', 3, '2-wp-django.js', 1000, 20000, 29999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('laravel-ruby', '1', 'Larabel, Ruby', 2, '1-laravel-ruby.js', 1000, 10000, 19999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('node-php', '4', 'Node, React, PHP', 3, '4-node-php.js', 1000, 40000, 49999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('shopify', '8', 'Shopify', 2, '8-shopify.js', 400, 80000, 89999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('ecommerce', '7', 'Ecommerce, Shopify', 3, '7-ecommerce.js', 400, 70000, 79999, NULL);
INSERT INTO "public"."tbl_profile" VALUES ('java-cs', 'J', 'Java/Spring, C#/ASP.NET', 3, 'J-java-cs.js', 100, 100, 999, NULL);

-- ----------------------------
-- Primary Key structure for table tbl_account
-- ----------------------------
ALTER TABLE "public"."tbl_account" ADD CONSTRAINT "tbl_account_pkey" PRIMARY KEY ("email");

-- ----------------------------
-- Primary Key structure for table tbl_application
-- ----------------------------
ALTER TABLE "public"."tbl_application" ADD CONSTRAINT "tbl_application_pkey" PRIMARY KEY ("email", "job_id");

-- ----------------------------
-- Primary Key structure for table tbl_message
-- ----------------------------
ALTER TABLE "public"."tbl_message" ADD CONSTRAINT "tbl_message_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table tbl_profile
-- ----------------------------
ALTER TABLE "public"."tbl_profile" ADD CONSTRAINT "unique_profile_symbol" UNIQUE ("symbol");

-- ----------------------------
-- Primary Key structure for table tbl_profile
-- ----------------------------
ALTER TABLE "public"."tbl_profile" ADD CONSTRAINT "tbl_profile_pkey" PRIMARY KEY ("id");
