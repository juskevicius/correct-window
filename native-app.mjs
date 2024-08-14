#!/usr/bin/env /home/?????????????????????????/.nvm/versions/node/v18.14.2/bin/node
import fs from "node:fs/promises";
import util from "node:util";
import { exec } from "child_process";
const executeSh = util.promisify(exec);

const LOG_FILE_PATH =
  "/home//?????????????????????????/dev/chrome-extensions/correct-window/logs/log.json";

async function log(message) {
  await fs.appendFile(LOG_FILE_PATH, `${message}\n`);
}

async function getMessage() {
  const header = new Uint32Array(1);
  await readFullAsync(1, header);
  const message = await readFullAsync(header[0]);
  const messageString = Buffer.from(message.buffer).toString();
  if (!messageString.length) {
    return;
  }

  const { profileName, url } = JSON.parse(messageString);
  const { stderr } = await executeSh(
    `google-chrome --profile-directory="${profileName}" "${url}"`
  );
  if (stderr) {
    await log(`Error when executing command: ${stderr}`);
    return;
  }

  return "ok";
}

async function readFullAsync(length, buffer = new Uint8Array(65536)) {
  const data = [];
  while (data.length < length) {
    const input = await fs.open("/dev/stdin");
    const { bytesRead } = await input.read({ buffer });
    await input.close();
    if (bytesRead === 0) {
      break;
    }
    data.push(...buffer.subarray(0, bytesRead));
  }
  return new Uint8Array(data);
}

async function sendMessage() {
  const message = new Uint8Array(
    Array.from("ok").map((letter) => letter.charCodeAt(0))
  );
  const header = new Uint32Array([message.length]);
  const stdout = await fs.open("/proc/self/fd/1", "w");
  await stdout.write(header);
  await stdout.write(message);
  await stdout.close();
}

async function main() {
  while (true) {
    try {
      const message = await getMessage();
      if (!message) {
        break;
      }
      await sendMessage();
    } catch (e) {
      await log(e);
      console.error(e);
      process.exit(1);
    }
  }
}

main();
