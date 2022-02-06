import { readFile, writeFile } from "fs/promises";
import transform from "./transform.js";

const [, , inPath, outPath] = process.argv;
const shouldMinify = !process.argv.includes("--nominify");
const file = await readFile(inPath);
const tranformed = await transform(file.toString(), shouldMinify);
await writeFile(outPath, tranformed);
