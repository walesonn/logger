import { exec } from "child_process";
import install from "./install.js";
import path from "path";
import fs from "fs";
import replaceAll from "./replaceAll.js";

function run(fileOrDir) {
  if (!fileOrDir) {
    console.log("Manual usage: node index <filename>");
  } else {
    if (!fs.existsSync(path.resolve(fileOrDir))) {
      console.log("File not found");
      return;
    }

    fs.lstat(path.resolve(fileOrDir), (err, stats) => {
      if (err) throw err;

      if (!stats.isDirectory() && !stats.isFile())
        throw Error("Arguments not is file or directory");

      if (stats.isFile()) {
        console.log(`Is File ${path.resolve(fileOrDir)}`);

        fs.readFile(
          path.resolve(fileOrDir),
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
        console.log(`Is Directory ${path.resolve(fileOrDir)}`);
        exec(`ls -a ${path.resolve(fileOrDir)}`, (err, stdout, stderr) => {
          if (err) throw err;

          let files = stdout.split("\n");

          if (!files.length) return console.log("Directory empty");

          const allLogFiles = files.filter(
            (filename) =>
              filename.indexOf(".log") != -1 || filename.indexOf(".gz") != -1
          );

          allLogFiles.forEach((file) => {
            if (path.resolve(`${fileOrDir}/${file}`).indexOf(".gz") != -1) {
              console.log(path.resolve(`${fileOrDir}/${file}`));
              exec(
                `sudo gunzip ${path.resolve(`${fileOrDir}/${file}`)}`,
                (err) => {
                  if (err) throw err;
                }
              );
            }
          });
        });
      }
    });
  }
}

function blockedIpsOfJail(jail, filename) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!jail) return reject(new Error("Not arguments"));

      let file = path.resolve(`~/${filename ?? "blockedIps.log"}`);

      let cmd = `sudo fail2ban-client status ${jail} | grep "[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}" > ${file}"`;

      exec(cmd, (err, stdout) => {
        if (err) throw err;
        resolve({ data: stdout, file: file });
      });
    } catch (error) {
      reject(error);
    }
  });
}

if (!process.argv[2]) {
  console.log(
    "Manual usage: node index.js --jail=<jailName> --outfile=<outfileName>"
  );
} else {
  blockedIpsOfJail(
    process.argv[2].split("=")[1],
    process.argv[3] ? process.argv[3].split("=")[1] : null
  ).then((data) => {
    console.log(data);
  });
}
