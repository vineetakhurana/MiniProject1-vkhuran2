var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
//var faker = require("faker");
var fs = require("fs");
//faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["site.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}


// function fakeDemo()
// {
// 	console.log( faker.phone.phoneNumber() );
// 	console.log( faker.phone.phoneNumberFormat() );
// 	console.log( faker.phone.phoneFormats() );
// }

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},

	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content'
  		}
		
	 },
	 fileWithNoContent:
	 {
	 	pathContent: 
	 	{	
   			file1: ''
   	 	}
	}
};



function generateTestCases()
{

	var content = "var site = require('./site.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = '\'\'';
		}
		//debugstmt1
		console.log( params );

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {mocking: 'fileWithContent' });
		var pathExists      = _.some(constraints, {mocking: 'fileExists' });
		var fileWithNoContent = _.some(constraints, {mocking: 'fileWithNoContent' });

		// var fileWithContent2 = _.some(constraints, {mocking: 'fileWithContent2' });
		// var pathExists2      = _.some(constraints, {mocking: 'fileExists' });

		// var mycode = _.some(constraints,{value:'212'});
		// var undefinedval = _.some(constraints,{value:'undefined'});
		// var zerovar = _.some(constraints,{value:'0'});
		var truevar = _.some(constraints,{value:true});
		var falsevar = _.some(constraints,{value:false});


		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			//debugstmt
			//console.log("i am the constraint"+ constraint)
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident] = constraint.value;
			}
		}

		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		//debugstmt
		console.log(args)
		if( pathExists || fileWithContent)
		{
			 	content += generateMockFsTestCases(pathExists,fileWithContent,!fileWithNoContent,funcName, args);
				content += generateMockFsTestCases(!pathExists,fileWithContent,!fileWithNoContent,funcName, args);
				// Bonus...generate constraint variations test cases....
				content += generateMockFsTestCases(!pathExists,!fileWithContent,!fileWithNoContent,funcName, args);
				
				content += generateMockFsTestCases(pathExists,!fileWithContent,!fileWithNoContent,funcName, args);
				//content += generateMockFsTestCases(pathExists,fileWithContent,!fileWithoutContent,funcName, args);
				 //if file w/o content
				content += generateMockFsTestCases(pathExists,!fileWithContent,fileWithNoContent,funcName, args);

				//console.log(mockFileLibrary.fileWithContent.pathContent.file1);
		}
	
		else if(truevar || falsevar)
		{

			//change this
			content += "site.{0}({1});\n".format(funcName, "'"+phone+"','"+format+"',"+options);
		}
		else
		{
			content += "site.{0}({1});\n".format(funcName, args);
		}

	}
	fs.writeFileSync('test.js', content, "utf8");
}

function generateMockFsTestCases (pathExists,fileWithContent,fileWithNoContent,funcName,args) 
{
	var testCase = "";
	// Insert mock data based on constraints.
	var mergedFS = {};
	var zeros = _.some(constraints, {value: '0'});
	
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}

	if( fileWithNoContent )
	{
	 	for (var attrname in mockFileLibrary.fileWithNoContent) { mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname]; }
	}

	// if(!pathExists)
	// {
	// 	for (var attrname in mockFileLibrary.pathNoExists) { mergedFS[attrname] = mockFileLibrary.pathNoExists[attrname]; }
	// }

	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsite.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}


function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					if( child.left.type == 'CallExpression')
					{
						//var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						functionConstraints[funcName].constraints.push( 
							{
								ident: child.left.arguments,
								value: child.right.value
							});
					}
				}

									
			// if( child.type == "CallExpression" && 
			// 		 child.callee.property &&
			// 		 child.callee.property.name =="readFileSync" )
			// 	{
			// 		for( var p =0; p < params.length; p++ )
			// 		{
			// 			if( child.arguments[0].name == params[p] )
			// 			{
			// 				functionConstraints[funcName].constraints.push( 
			// 				{
			// 					// A fake path to a file
			// 					ident: params[p],
			// 					value: "'pathContent/file1'",
			// 					mocking: 'fileWithContent'
			// 				});
			// 			}
			// 		}

					
			// 	}

			// 	if( child.type == "CallExpression" && 
			// 		 child.callee.property &&
			// 		 child.callee.property.name =="readFileSync" ) {
			// 	for( var p =0; p < params.length; p++ )
			// 		{
			// 			if( child.arguments[0].name == params[p] )
			// 			{
			// 				functionConstraints[funcName].constraints.push( 
			// 				{
			// 					// A fake path to a file
			// 					ident: params[p],
			// 					value: "'pathContent/file1'",
			// 					mocking: 'fileWithNoContent'
			// 				});
			// 			}
			// 		}
			// 	}



				// if( child.type == "CallExpression" &&
				// 	 child.callee.property &&
				// 	 child.callee.property.name =="existsSync")
				// {
				// 	for( var p =0; p < params.length; p++ )
				// 	{
				// 		if( child.arguments[0].name == params[p] )
				// 		{
				// 			functionConstraints[funcName].constraints.push( 
				// 			{
				// 				// A fake path to a file
				// 				ident: params[p],
				// 				value: "'path/fileExists'",
				// 				mocking: 'fileExists'
				// 			});
				// 		}
				// 	}
				// }

				
			});

			console.log( functionConstraints[funcName]);

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();