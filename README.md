# HLCC
The client mod agnostic tool to build Discord snippets, powered by swc

[![wakatime](https://wakatime.com/badge/github/yellowsink/HLCC.svg)](https://wakatime.com/badge/github/yellowsink/HLCC)
![npm](https://img.shields.io/npm/v/hlcc)

## Installation
`npm i -D hlcc` or `pnpm i -D hlcc`

## Basic Usage
Your code should be wrapped in `hlccInject`, as such:
```js
hlccInject([], () => {
    console.log("Hello, World! from HLCC")
});
```

Any instance of hlccInject is transformed.

As of writing, the `e` object is available inside your injected function (so you can get the raw module list by `e.c`).
This is not *intended* per-se, and is subject to not work at any point.

Now simply build your code: `npm exec hlcc -- mycode.js output.js` or `pnpm hlcc mycode.js output.js`

## Module finding
HLCC will can do any module finding for you.
The first argument of the `hlccInject` call is a list of module finds:
 - `hlccAll()` - returns an object with every module on it.
 - `hlccByProps(...string[])` - returns the first module that has all props passed.
 - `hlccByDName(string)` - returns the first module that has the given display name. Useful for finding React components.

 Note that all props passed to these functions MUST be string literals -
 using variables etc is not allowed currently (watch this space!).

## As an API
HLCC exports an (async) function to run its transform (and optionally / by default minify).

```js
import hlcc from "hlcc";
// hlcc: (input: string, shouldMinify?: boolean) => Promise<string>
const code = "hlccInject([], () => {});";
const tranformed = await hlcc(code); // see below example for sample output
const unminified = await hlcc(code, false); // should be pretty self-explanatory
```

## A full example (as a build tool)
This is an example input code to HLCC.
It will log the `SettingsView` component, the `getChannel` function, and the amount of modules.

```js
hlccInject([
    hlccAll(),
    hlccByDName("SettingsView"),
    hlccByProps("getChannel", "getCategory"),
  ],
  (mods, SettingsView, { getChannel }) => {
    console.log([SettingsView, getChannel, Object.keys(mods).length]);
  }
);
```

Here is the generated code - with `--nominify` flag and run through prettier:
```js
{
  const _finds = [];
  webpackChunkdiscord_app.push([
    [Symbol()],
    {},
    (e) => {
      _finds[0] = e.c;
      for (const k in e.c) {
        const m = e.c[k].exports;
        const mDef = m?.default && m.__esModule ? m.default : m;
        if (mDef?.displayName === "SettingsView") _finds[1] = m;
        if (mDef?.getChannel && mDef.getCategory) _finds[2] = mDef;
      }
    },
  ]);
  webpackChunkdiscord_app.pop();
  if (_finds.length < 3 || _finds.includes(void 0)) throw "";
  ((mods, SettingsView, { getChannel }) => {
    console.log([SettingsView, getChannel, Object.keys(mods).length]);
  })(..._finds);
}
```

Here is the actual output as HLCC will output it:
```js
{const a=[];webpackChunkdiscord_app.push([[Symbol()],{},b=>{a[0]=b.c;for(const c in b.c){const d=b.c[c].exports;const e=d?.default&&d.__esModule?d.default:d;if(e?.displayName==="SettingsView")a[1]=d;if(e?.getChannel&&e.getCategory)a[2]=e}}]);webpackChunkdiscord_app.pop();if(a.length<3||a.includes(void 0))throw"";((a,b,{getChannel:c})=>{console.log([b,c,Object.keys(a).length])})(...a)}
```