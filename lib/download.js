const fs = require("fs-extra");

module.exports = async function fetchRemotePreset(name, clone) {
  const os = require("os");
  const path = require("path");
  const download = require("download-git-repo");
  const tmpdir = path.join(os.tmpdir(), "iot-cli");

  if (clone) {
    await fs.remove(tmpdir);
  }

  return await new Promise((resolve, reject) => {
    download(name, tmpdir, { clone }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};
