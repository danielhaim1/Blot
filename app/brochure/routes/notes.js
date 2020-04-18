var Express = require("express");
var notes = new Express.Router();
var marked = require("marked");
const fs = require("fs-extra");
const NOTES_DIRECTORY = require("helper").rootDir + "/notes";
const path = require("path");

const HASH_TITLE_REGEX = /\# (.*)/;
const DASH_TITLE_REGEX = /(.*)\n-+\n/;

const removeIgnorableItems = (name) =>
  name[0] !== "." && name[0] !== "_" && name !== "README";

const extractName = (filePath) => {
  const contents = fs.readFileSync(filePath, "utf-8");
  const hashTitle = HASH_TITLE_REGEX.exec(contents);
  const dashTitle = DASH_TITLE_REGEX.exec(contents);

  if (hashTitle && hashTitle[1]) {
    return hashTitle[1];
  } else if (dashTitle && dashTitle[1]) {
    return dashTitle[1];
  } else {
    return filePath.split("/").pop();
  }
};

const withoutExtension = (name) => path.parse("/" + name).name;

notes.use(function(req, res, next) {
  res.locals.base = "/notes";
  res.locals.layout = "";
  res.locals.selected = {};
  next();
});

const TOC = fs
  .readdirSync(NOTES_DIRECTORY)
  .filter(removeIgnorableItems)
  .map((section) => {
    return {
      name: section[0].toUpperCase() + section.slice(1),
      id: section,
      items: fs
        .readdirSync(NOTES_DIRECTORY + "/" + section)
        .filter(removeIgnorableItems)
        .map((article) => {
          return {
            name: extractName(NOTES_DIRECTORY + "/" + section + "/" + article),
            id: article,
            slug:
              "/notes/" +
              withoutExtension(section) +
              "/" +
              withoutExtension(article),
          };
        }),
      slug: "/notes/" + path.parse("/" + section).name,
    };
  });

notes.param("section", function(req, res, next) {
  res.locals.selected[req.params.section] = "selected";
  res.locals.toc = TOC.map((section) => {
    section.isSelected = req.params.section === section.id ? "selected" : false;
    return section;
  });
  res.locals.section = "/notes/" + req.params.section;
  next();
});

notes.param("article", function(req, res, next) {
  res.locals.selected[req.params.article] = "selected";
  next();
});

notes.get("/", function(req, res, next) {
  res.locals.title = "Notes - Blot";
  res.locals.toc = TOC;
  next();
});

notes.get("/:section", function(req, res, next) {
  res.locals.body = marked(
    fs.readFileSync(
      NOTES_DIRECTORY + "/" + req.params.section + "/README",
      "utf-8"
    )
  );
  next();
});

notes.get("/:section/:article", function(req, res, next) {
  res.locals.body = marked(
    fs.readFileSync(
      NOTES_DIRECTORY +
        "/" +
        req.params.section +
        "/" +
        req.params.article +
        ".txt",
      "utf-8"
    )
  );
  next();
});

notes.get(["/", "/:section/:article", "/:section"], function(req, res) {
  res.render("notes/layout");
});
module.exports = notes;
