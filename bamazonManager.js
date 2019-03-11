var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazondb"
});

connection.connect(function(err) {
  if (err) throw err;
});


function DisplayItems() {
  connection.query(
    "SELECT * from products",function(err, res) {
      if (err) console.log(err);
      const table = cTable.getTable(res);
      console.log(table);
      console.log("\n");
      Main();
    }
  );
};
function DisplayStock() {
  connection.query(
    "SELECT products.ID,products.Product,products.Stock from products",function(err, res) {
      if (err) console.log(err);
      const table = cTable.getTable(res);
      console.log(table);
      console.log("\n");
      AddInventary();
    }
  );
};
function CurrentDepartments() {
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT DISTINCT departments.department from departments",function(err, res) {
        if (err) reject(err);
        var departments = [];
        res.forEach(dep => 
        departments.push(dep.department))
        resolve(departments);
      }
    );
  });
};
function MaxID(){
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT products.ID FROM products",function(err, res) {
        if (err) reject(err);
        var MaxID = res[res.length-1].ID;
        resolve(MaxID);
      }
    );
  });
};
function DisplayLowInventary() {
  connection.query(
    "SELECT * from products WHERE Stock<5",function(err, res) {
      if (err) console.log(err);
      console.table(res);
      console.log("\n");
      Main();
    }
  );
};
function Quantity(ID){
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT products.Stock from products WHERE ID=?",[ID],
      function(err, res) {
        if (err) reject(err);
        resolve(res[0].Stock);
      }
    );
  });
};
function UpdateQuantity(Stock,ID) {
    connection.query(
      "UPDATE products SET Stock=? WHERE ID=?",[Stock,ID],function(err, res) {
        if (err) console.log(err);
        console.log("Item restocked");
        console.log("\n");
        Main();
      }
    );
};
function AddInventary(){
  MaxID()
  .then(MaxID => {
    inquirer
    .prompt([
      { type: "input", 
      message: "What is the ID of the item you would like to restock?", 
      validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <=parseInt(MaxID)) {
            return true;
          }
          return false;
        },
      name: "id" },
      { type: "input", 
      message: "How many units would you like to add?",
      validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0 ) {
            return true;
          }
          return false;
        }, 
      name: "quantity" },

    ])
    .then(function(Response) {
      Quantity(Response.id)
        .then(currentStock => {
          var NewStock = parseInt(currentStock)+parseInt(Response.quantity);
          UpdateQuantity(NewStock,Response.id)
        })
        .catch(err => {console.log(err)});
    });

  })
  .catch(err => {console.log(err)});


  
};
function NewProduct(Product, Department, Price, Stock) {
  connection.query(
    "INSERT INTO products (Product, Department, Price, Stock) VALUES (?,?,?,?)",
    [Product, Department, Price, Stock],
    function(err, res) {
      if (err) throw err;
      Main();
    }
  );
};
function AddNewProduct(){
  CurrentDepartments().then(departments=>{
    inquirer
    .prompt([
      { type: "input",
        message: "What is the name of the product?",
        name: "product"
      },
      { type: "list",
        message: "From what department is it?",
        choices: departments,
        name: "department"
      },
      { type: "input",
        message: "What is price of it?",
        validate: function(value) {
        if (isNaN(value) === false && parseFloat(value) > 0) {
          return true;
        }
        return false;
        },
        name: "price"
      },
      { type: "input",
        message: "What is going to be the initial stock?",
         validate: function(value) {
        if (isNaN(value) === false && parseInt(value) > 0) {
          return true;
        }
        return false;
        },
        name: "stock"
      }
    ])
    .then(function(Response) {
      var Price = parseFloat(Response.price).toFixed(2);
      NewProduct(Response.product,Response.department,Price,parseInt(Response.stock));
    });
  }).catch(err => {console.log(err)});
  
};
function Main(){
  inquirer
    .prompt([
      { type: "list",
        message: "What do you want?",
        choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product","Exit"],
        name: "choice"
      }
    ])
    .then(function(Response) {
      if(Response.choice === "View Products for Sale"){
        DisplayItems();
      }
      else if (Response.choice === "View Low Inventory"){
        DisplayLowInventary();
      }
      else if (Response.choice === "Add to Inventory"){
        DisplayStock();
      }
      else if (Response.choice === "Add New Product"){
        AddNewProduct();
      }
      else {
        connection.end();
      }
    });
};


Main();