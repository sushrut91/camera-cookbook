//Dependencies
var express = require('express');
var mysql = require('mysql');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const uuidGenerator = require('uuid/v4');

var app = express();

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

//load config file
var config = require('./config');
//Set token from config

app.set('superSecret', config.secret);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var connection = mysql.createPool({
	connectionLimit:50,
	host:'####',
	user:'####',
	password:'####',
	database:'####'
});
// Middleware

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {  
      if (err) {
		  console.log(err);
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


////////////////////////////////////////////////////
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

app.post('/authenticate', function(req,resp){
	var usr = req.body.name;
	var token = jwt.sign(usr, app.get('superSecret'), {
          //expiresIn: 60*60*24 
		  });

        // return the information including token as JSON
        resp.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
});
app.post('/api/saveIngredient', function(req, resp) {
	
	//Insert camera_ingredient object
	var ID = JSON.stringify(uuidGenerator());
    var user_suggested_name = JSON.stringify(req.body.user_suggested_name);
	var dominant_color = JSON.stringify(req.body.dominant_color);
	var contour_shape = JSON.stringify(req.body.contour_shape);
	var shape_vertices = req.body.shape_vertices;
	var cusine = JSON.stringify(req.body.cusine);
	var no_of_contours = req.body.no_of_contours;
	var red_value = req.body.red_value;
	var green_value = req.body.green_value;
	var blue_value = req.body.blue_value;
	var use_frequency = req.body.use_frequency;
	
	var cameraInsertQuery = "INSERT INTO camera_ingredients"+
	"(ID,user_suggested_name,dominant_color,contour_shape,shape_vertices,cusine,no_of_contours,red_value,green_value,blue_value,use_frequency) VALUES(" +
	  ID + "," +
	  user_suggested_name +"," +
	  dominant_color + "," +
	  contour_shape + "," +
	 shape_vertices + "," +
	 cusine + "," +
	 no_of_contours + "," +
	 red_value + "," +
	 green_value + "," +
	 blue_value + "," +
	 use_frequency + ");" 
	 
	 //Insert Google Ingredient
	 var GID = JSON.stringify(uuidGenerator());
	 //Foreign key
	 var camera_ingredients_ID = ID;
	 var google_suggested_name = JSON.stringify(req.body.google_suggested_name);
	 var google_dominant_color = JSON.stringify(req.body.google_dominant_color);
	 var google_red_value = req.body.google_red_value;
	 var google_green_value = req.body.google_green_value;
	 var google_blue_value = req.body.google_blue_value;
	 var google_suggestions = JSON.stringify(req.body.google_suggestions);
	 
	 var googleInsertQuery = "INSERT INTO google_ingredients"+
	"(ID,camera_ingredients_ID ,google_suggested_name,google_dominant_color,google_red_value,google_green_value,google_blue_value,google_suggestions) VALUES(" +
	  GID +"," +
	  camera_ingredients_ID + "," +
	  google_suggested_name +"," +
	  google_dominant_color + "," +
	  google_red_value + "," + google_green_value + "," + google_blue_value + "," +
	  google_suggestions + ");" 
	 
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
