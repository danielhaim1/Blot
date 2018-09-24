var fs = require("fs-extra");
var helper = require("helper");
var localPath = helper.localPath;
var Git = require("simple-git");
var debug = require("debug")("clients:git:remove");
var checkGitRepoExists = require('./checkGitRepoExists');

// This should probably copy the file to a
// temporary location so the removal can be
// rolled back if we encounter an error
module.exports = function remove(blogID, path, callback) {
  var git;

  debug("Blog:", blogID, "Removing", path);

  checkGitRepoExists(blogID, function(err){

    if (err) return callback(err);

    fs.remove(localPath(blogID, path), function(err) {
      if (err) return callback(err);

      // Throws an error if directory does not exist
      try {
        git = Git(localPath(blogID, "/")).silent(true);        
      } catch (err) {
        return callback(err);
      }

      // Git does not like paths with leading slashes
      if (path[0] === "/") path = path.slice(1);

      // Could we queue these commands for better performance?
      git.add(path, function(err){

        // simple-git returns errors as strings
        if (err) return callback(new Error(err));

        git.commit("Removed " + path, function(err){

          if (err) return callback(new Error(err));
        
          // We push changes made to the bare repository
          git.push(function(err) {
          
            if (err) return callback(new Error(err));
        
            debug("Blog:", blogID, "Successfully removed", path);
            callback(null);
          });
        });
      });
    });
  });

};
