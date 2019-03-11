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
    "SELECT products.ID,products.Product,products.Department,products.Price from products",function(err, res) {
      if (err) console.log(err);
      const table = cTable.getTable(res);
      console.log(table);
      console.log("\n");
      Buy();
    }
  );
};
function QuantityPrice(ID){
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT products.Stock,products.Price from products WHERE ID=?",[ID],
      function(err, res) {
        if (err) reject(err);
        var array = [res[0].Stock,res[0].Price]
        resolve(array);
      }
    );
  });
};
function UpdateQuantity(Stock,ID) {
    connection.query(
      "UPDATE products SET Stock=? WHERE ID=?",[Stock,ID],function(err, res) {
        if (err) console.log(err);
      }
    );
};
function Sales(ID){
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT products.Product_Sales from products WHERE ID=?",[ID],
      function(err, res) {
        if (err) reject(err);
        resolve(res[0].Product_Sales);
      }
    );
  });
};
function UpdateSales(Sales,ID) {
    connection.query(
      "UPDATE products SET Product_Sales=? WHERE ID=?",[Sales,ID],function(err, res) {
        if (err) console.log(err);
      }
    );
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
function Buy(){
  MaxID()
  .then(MaxID => {
    inquirer
    .prompt([
      { type: "input", 
      message: "What is the ID of the item you would like to buy?", 
      validate: function(value) {
        if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <=parseInt(MaxID)) {
          return true;
        }
        return false;
        },
      name: "id" },
      { type: "input", 
      message: "How many units would you like?",
      validate: function(value) {
        if (isNaN(value) === false && parseInt(value) > 0) {
          return true;
        }
        return false;
        }, 
      name: "quantity" },

    ])
    .then(function(Response) {

      QuantityPrice(Response.id)
          .then(item => {
            Sales(Response.id)
              .then(sales =>{
                var stock = item[0];
                var price = item[1];
                if(stock < Response.quantity){
                  console.log("Insufficient quantity!");
                }
                else{
                  var NewStock = parseInt(stock)-parseInt(Response.quantity);
                  UpdateQuantity(NewStock,Response.id);
                  
                  var totalPrice = parseFloat(price)*parseInt(Response.quantity);
                  console.log(`The total cost is $${totalPrice.toFixed(2)}`);
                  var totalSales = parseFloat(sales)+parseFloat(totalPrice.toFixed(2));
                  UpdateSales(totalSales,Response.id);
                }
                Main();
              }).catch(err => {console.log(err)});

          })
          .catch(err => {console.log(err)});
    });

  })
  .catch(err => {console.log(err)});


  
};
function Main(){
  inquirer
    .prompt([
      { type: "list",
        message: "What do you want?",
        choices: ["Buy","Exit"],
        name: "choice"
      }
    ])
    .then(function(Response) {
      if(Response.choice === "Buy"){
        DisplayItems();
      }
      else{
        connection.end();
      }
    });
};

Main();



