//Dependencies
var express = require('express');
var mysql = require('mysql');
const uuidGenerator = require('uuid/v4');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var connection = mysql.createPool({
	connectionLimit:50,
	host:'localhost',
	user:'testuser',
	password:'test',
	database:'cameracookbookapp'
});

app.get("/api/getIngredients",function(req,resp){
	connection.getConnection(function(error,tempConnection){
		if(error){
			console.log(error);
			tempConnection.release();
		} else{
			tempConnection.query("SELECT * FROM camera_ingredients",
			function(error,rows,fields){
				if(error){
					console.log(error);
				}else{
					resp.json(rows);
				}
			});
		}
	});
});

app.post('/api/saveIngredient', function(req, resp) {
	
	//Insert camera_ingredient object
	var ID = uuidGenerator();
    var user_suggested_name = req.body.user_suggested_name;
	var dominant_color = req.body.dominant_color;
	var contour_shape = req.body.contour_shape;
	var shape_vertices = req.body.shape_vertices;
	var cusine = req.body.cusine;
	var no_of_contours = req.body.no_of_contours;
	var red_value = req.body.red_value;
	var green_value = req.body.green_value;
	var blue_value = req.body.blue_value;
	var use_frequency = req.body.use_frequency;
	console.log(req.body.user_suggested_name);
	
	var cameraInsertQuery = "INSERT INTO camera_ingredients"+
	"(ID,user_suggested_name,dominant_color,contour_shape,shape_vertices,cusine,no_of_contours,red_value,green_value,blue_value,use_frequency) VALUES(" +
	  "'" + ID + "'," +
	  "'" + user_suggested_name +"'," +
	  "'" + dominant_color + "'," +
	  "'" + contour_shape + "'," +
	 shape_vertices + "," +
	  "'" + cusine + "'," +
	 no_of_contours + "," +
	 red_value + "," +
	 green_value + "," +
	 blue_value + "," +
	 use_frequency + ");" 
	 
	 //Insert Google Ingredient
	 var GID = uuidGenerator();
	 //Foreign key
	 var camera_ingredients_ID = ID;
	 var google_suggested_name = req.body.google_suggested_name;
	 var google_dominant_color = req.body.google_dominant_color;
	 var google_red_value = req.body.google_red_value;
	 var google_green_value = req.body.google_green_value;
	 var google_blue_value = req.body.google_blue_value;
	 var google_suggestions = req.body.google_suggestions;
	 
	 var googleInsertQuery = "INSERT INTO google_ingredients"+
	"(ID,camera_ingredients_ID ,google_suggested_name,google_dominant_color,google_red_value,google_green_value,google_blue_value,google_suggestions) VALUES(" +
	  "'" + GID + "'," +
	  "'" + camera_ingredients_ID + "'," +
	  "'" + google_suggested_name +"'," +
	  "'" + google_dominant_color + "'," +
	  google_red_value + "," + google_green_value + "," + google_blue_value + "," +
	  "'" + google_suggestions + "');" 
	 
    connection.getConnection(function(error,tempConnection){
		if(error){
			console.log(error);
			tempConnection.release();
		} else{
			
			//Insert into camera ingredients
			tempConnection.query(cameraInsertQuery,
			function(error,rows,fields){
				if(error){
					console.log(error);
				}else{
					
						//Insert into google ingredients
						tempConnection.query(googleInsertQuery,
						function(error,rows,fields){
							if(error){
								console.log(error);
							}else{
								resp.json(rows);
							}
						});
				}
			});
			
			
		}
	});
});

//Server config
app.listen(8080,function(){
	console.log("Express server is running on port 8080");
});