ALTER USER 'root'@'localhost'  IDENTIFIED WITH mysql_native_password BY '';
DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products(
  ID INT NOT NULL AUTO_INCREMENT,
  Product VARCHAR(100) NOT NULL,
  Department VARCHAR(100) NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  Stock INTEGER(4) NOT NULL,
  Product_Sales DECIMAL(20,2) DEFAULT 0,
  PRIMARY KEY (id)
);

INSERT INTO products (Product, Department, Price, Stock)
VALUES ("Blender", "Home & Kitchen", "99.95",15),("Sectional Sofa","Home & Kitchen","259.99",10),("Memory Foam Mattress","Home & Kitchen","135.99",25);

INSERT INTO products (Product, Department, Price, Stock)
VALUES ("PS4 PRO", "Electronics", "349.99",10),('TV LG 43"',"Electronics","269.99",5),("Super Mario Party","Electronics","53.99",6);

INSERT INTO products (Product, Department, Price, Stock)
VALUES ("Exploding Kittens Card Game", "Toys & Games", "19.99",3),("Barbie Fairytale Ballerina","Toys & Games","7.14",2),("Monopoly Deal Card Game","Toys & Games","7.99",5);


CREATE TABLE departments(
  ID INT NOT NULL AUTO_INCREMENT,
  Department VARCHAR(100) NOT NULL,
  Over_Head_Cost INT(20) NOT NULL,
  PRIMARY KEY (id)
);
INSERT INTO departments(Department,Over_Head_Cost)
VALUES("Home & Kitchen",10000),("Electronics",10000),("Toys & Games",5000);

SELECT * FROM PRODUCTS;
SELECT * FROM departments;

SELECT departments.id,departments.department,departments.Over_Head_Cost,DepartmentsTable.Product_Sales,DepartmentsTable.Product_Sales - Over_Head_Cost as "Total Profit"
From departments 
INNER JOIN (SELECT products.department,SUM(product_sales) as "Product_Sales" FROM products GROUP BY department) DepartmentsTable
ON departments.department = DepartmentsTable.department;
