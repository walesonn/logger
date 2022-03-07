import { exec } from "child_process";
import path from "path";
import fs from "fs";
import replaceAll from "./replaceAll.js";

function run() {
  if (!process.argv[2]) {
    console.log("Manual usage: node index <filename>");
  } else {
    if (!fs.existsSync(path.resolve(process.argv[2]))) {
      console.log("File not found");
      return;
    }

    fs.lstat(path.resolve(process.argv[2]), (err, stats) => {
      if (err) throw err;

      if (!stats.isDirectory() && !stats.isFile())
        throw Error("Arguments not is file or directory");

      if (stats.isFile()) {
        console.log(`Is File ${path.resolve(process.argv[2])}`);

        fs.readFile(
          path.resolve(process.argv[2]),
          { encoding: "utf-8" },
          (err, data) => {
            if (err) throw err;
            let ips = replaceAll(data, null, "");
            let cmd = `egrep "(${replaceAll(ips, /[ ]/, "|")})"`;
            console.log(cmd);
          }
        );
      }

      if (stats.isDirectory()) {
        console.log(`Is Directory ${path.resolve(process.argv[2])}`);
        exec(
          `ls -a ${path.resolve(process.argv[2])}`,
          (err, stdout, stderr) => {
            if (err) throw err;

            let files = stdout.split("\n");

            if (!files.length) return console.log("Directory empty");

            const allLogFiles = files.filter(
              (filename) =>
                filename.indexOf(".log") != -1 || filename.indexOf(".gz") != -1
            );

            allLogFiles.forEach((file) => {
              if (
                path.resolve(`${process.argv[2]}/${file}`).indexOf(".gz") != -1
              ) {
                console.log(path.resolve(`${process.argv[2]}/${file}`));
                exec(
                  `sudo gunzip ${path.resolve(`${process.argv[2]}/${file}`)}`,
                  (err) => {
                    if (err) throw err;
                  }
                );
              }
            });
          }
        );
      }
    });
  }
}

run();
