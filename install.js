import { exec } from "child_process";
import os from "os";

export default function (tool) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!tool) return reject(new Error(`Argument not provided`));
      if (os.platform() !== "linux")
        return reject(new Error(`System not is linux based`));

      let command = `apt install ${tool} -y`;

      exec(command, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout: stdout, stderr: stderr });
      });
    } catch (error) {
      reject(error);
    }
  });
}
