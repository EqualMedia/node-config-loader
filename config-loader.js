var fs = require("fs"),
    path = require("path");

exports.load = function(relpath){
  var dir = path.dirname(relpath);
  var name = path.basename(relpath, ".js");
  
  var json;
  var src, tried = [];
  try{
    // Try loading from the dir itself
    var src = path.join(dir, "config", name + ".json");
    tried.push(src);
    json = fs.readFileSync(src);
  }catch(e){
    // Try loading from the parent directory
    src = path.join(dir, "..", "config", name + ".json");
    tried.push(src);
    json = fs.readFileSync(src);
  }finally{
    if(!json){
      throw new Error("Could not load configuration file, tried:\n" + tried.join("\n"));
    }
    
    try{
      return JSON.parse(json);
    }catch(e){
      throw new Error("Error parsing " + tried[tried.length - 1]);
    }
  }
};
