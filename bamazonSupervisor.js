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

function DisplaySales() {
  connection.query(
    `SELECT departments.id,departments.department,departments.Over_Head_Cost,DepartmentsTable.Product_Sales,
    DepartmentsTable.Product_Sales - Over_Head_Cost as 'Total Profit' 
    From departments 
    INNER JOIN (SELECT products.department,SUM(product_sales) as 'Product_Sales' 
                FROM products 
                GROUP BY department) DepartmentsTable 
    ON departments.department = DepartmentsTable.department
    `,
    function(err, res) {
      if (err) console.log(err);
      const table = cTable.getTable(res);
      console.log(table);
      console.log("\n");
      Main();
    }
  );
};
function CurrentDepartments() {
  return new Promise(function(resolve, reject) {
    connection.query(
      "SELECT DISTINCT departments.department from departments",function(err, res) {
        if (err) reject(err);
        var departments = [];
        res.forEach(department => 
        departments.push(department.department))
        resolve(departments);
      }
    );
  });
};
function AddDepartment(Department){
  connection.query(
    "INSERT INTO departments (Department,Over_Head_Cost) VALUES (?,5000)",
    [Department],
    function(err, res) {
      if (err) throw err;
    }
  );
};
function CreateDepartment(){
  inquirer
    .prompt([
      { type: "prompt",
        message: "What is the new department you want to create?",
        name: "department"
      }
    ])
    .then(function(Response) {
      CurrentDepartments().
      then(departments =>{
        if (departments.includes(Response.department)){
          console.log("Department already exists");
          Main();
        } 
        else{
          AddDepartment(Response.department);
           console.log("Department created");
          Main();
        }
      }).catch(err => {console.log(err)});

    });
}
function Main(){
  inquirer
    .prompt([
      { type: "list",
        message: "What do you want?",
        choices: ["View Product Sales by Department","Create New Department","Exit"],
        name: "choice"
      }
    ])
    .then(function(Response) {
      if(Response.choice === "View Product Sales by Department"){
        DisplaySales();
      }
      else if(Response.choice === "Create New Department"){
        CreateDepartment();
      }
      else{
        connection.end();
      }
    });
};

Main();



