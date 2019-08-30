// This function accepts some HTML makes it suitable for 
// inclusion in a CDATA-fenced description tag for an RSS
// feed item. It resolves relative URLs to make the result
// more portable. It should help produce valid feeds.

var absoluteURLs = require('./absoluteURLs').absoluteURLs;

// Removes everything forbidden by XML 1.0 specifications,
// plus the unicode replacement character U+FFFD
function removeXMLInvalidChars(string) {
  var regex = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g;
  return string.replace(regex, "");
}

module.exports = function (req, callback) {
  return callback(null, function() {
    return function(text, render) {
      var xml;

      text = render(text);
      
      try {
        xml = absoluteURLs(req.protocol + "://" + req.get("host"), text);
        xml = removeXMLInvalidChars(xml);        
      } catch (e) {
        console.log(e);
        // do nothing if we can't 
      }

      return xml || text;
    };
  });
};
