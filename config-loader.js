var fs = require("fs"),
    path = require("path");

module.exports = exports = function(name){
  var configPaths = [];
  if(process.mainModule){
    configPaths = process.mainModule.paths.map(function(dir){
      return dir.replace("node_modules", "config");
    });
  }else{
    var dir = process.cwd();
    while(dir !== "/"){
      configPaths.push(path.join(dir, "config"));
      dir = path.dirname(dir);
    }
    configPaths.push(path.join(dir, "config"));
  }
  
  var filename = name + ".json";
  var src;
  var json;
  var tried = [];
  while(configPaths.length && !json){
    src = path.join(configPaths.shift(), filename);
    tried.push(src);
    
    try{
      json = fs.readFileSync(src, "utf8");
    }catch(e){}
  }
  
  if(!json){
    throw new Error("Could not load configuration file, tried:\n" + tried.join("\n"));
  }
  
  try{
    var config = JSON.parse(stripComments(json));
    Object.defineProperty(config, "-src-", {
      value: src,
      enumerable: false
    });
    return config;
  }catch(e){
    throw new Error("Error parsing " + src);
  }
};

var NoComment = 0,
    SingleLineComment = 1,
    MultiLineComment = 2;
function stripComments(json){
  var stripped = "";
  var inComment = NoComment, inString = false;
  
  for(var i = 0; i < json.length; i++){
    var current = json[i];
    var skip = inComment === SingleLineComment || inComment === MultiLineComment;
    
    if(inComment === NoComment && current === "\"" && json[i - 1] !== "\\"){
      inString = !inString;
    }
    
    if(!inString){
      var next = json[i + 1];
      if(!inComment && current === "/" && (next === "/" || next === "*")){
        inComment = next === "/" ? SingleLineComment : MultiLineComment;
        skip = true;
        i++;
      }else if(inComment === SingleLineComment && current === "\n"){
        inComment = NoComment;
      }else if(inComment === MultiLineComment && current === "*" &&  next === "/"){
        inComment = NoComment;
        i++;
      }
    }
    
    if(!skip){
      stripped += current;
    }
  }
  
  return stripped;
}