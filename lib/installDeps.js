const { execSync } = require("child_process");
const execa = require("execa");
const readline = require("readline");

let _hasYarn;

function toStartOfLine(stream) {
  if (!chalk.supportsColor) {
    stream.write("\r");
    return;
  }
  readline.cursorTo(stream, 0);
}

function renderProgressBar(curr, total) {
  const ratio = Math.min(Math.max(curr / total, 0), 1);
  const bar = ` ${curr}/${total}`;
  const availableSpace = Math.max(0, process.stderr.columns - bar.length - 3);
  const width = Math.min(total, availableSpace);
  const completeLength = Math.round(width * ratio);
  const complete = `#`.repeat(completeLength);
  const incomplete = `-`.repeat(width - completeLength);
  toStartOfLine(process.stderr);
  process.stderr.write(`[${complete}${incomplete}]${bar}`);
}

function hasYarn() {
  if (process.env.IOT_CLI_TEST) {
    return true;
  }
  if (_hasYarn != null) {
    return _hasYarn;
  }
  try {
    execSync("yarnpkg --version", { stdio: "ignore" });
    return (_hasYarn = true);
  } catch (e) {
    return (_hasYarn = false);
  }
}

exports.installDeps = function installDeps(targetDir) {
  const args = [];
  const command = hasYarn() ? "yarn" : "npm";
  if (!hasYarn()) {
    args.push("install");
  }
  return new Promise((resolve, reject) => {
    const child = execa(command, args, {
      cwd: targetDir
    });
    if (command === "yarn") {
      child.stderr.on("data", buf => {
        const str = buf.toString();
        if (/warning/.test(str)) {
          return;
        }

        // progress bar
        const progressBarMatch = str.match(/\[.*\] (\d+)\/(\d+)/);
        if (progressBarMatch) {
          // since yarn is in a child process, it's unable to get the width of
          // the terminal. reimplement the progress bar ourselves!
          renderProgressBar(progressBarMatch[1], progressBarMatch[2]);
          return;
        }

        process.stderr.write(buf);
      });
    }
    child.on('close', code => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
        return
      }
      resolve()
    })
  });
};
