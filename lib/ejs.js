const ejs = require("ejs");
const fs = require("fs");
const fsExtra = require("fs-extra");
const os = require("os");
const path = require("path");
const _ = require("lodash");

const copy = function(sourceDir, targetDir, parseCallback) {
  fsExtra.ensureDirSync(targetDir);
  let files = fs.readdirSync(sourceDir);
  for (let filename of files) {
    let filepath = path.join(sourceDir, filename);
    let stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      copy(filepath, path.join(targetDir, filename), parseCallback);
    // } else if (path.extname(filename).toLowerCase() === ".ejs") {
    //   parseCallback(filepath, filename, targetDir);
    } else {
      parseCallback(filepath, filename, targetDir);
      // fs.copyFileSync(filepath, path.join(targetDir, filename));
    }
  }
};
const removeExtNameEjs = function(filename) {
  return _.filter(
    filename.split("."),
    item => item.toLowerCase() !== "ejs"
  ).join(".");
};
exports.parse = function(targetDir, data) {
  const tmpdir = path.join(os.tmpdir(), "iot-cli");
  copy(tmpdir, targetDir, (filepath, filename, targetDir) => {
    ejs.renderFile(filepath, data, function(err, str) {
      if (err) throw err;
      let outputFilename = path.join(targetDir, removeExtNameEjs(filename));
      fs.writeFileSync(outputFilename, str);
    });
  });
};
