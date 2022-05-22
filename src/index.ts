#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import hlcc from "./transform.js";

const [, , inPath, outPath] = process.argv;
const shouldMinify = !process.argv.includes("--nominify");
const file = await readFile(inPath);
const tranformed = hlcc(file.toString(), shouldMinify);
await writeFile(outPath, tranformed);
