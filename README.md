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

Here is the generated code - for this minifying was disabled and the code was run through prettier:
```js
(() => {
  webpackChunkdiscord_app.push([
    [Symbol()],
    {},
    (e) => {
      const _0 = e.c;
      let _1;
      let _2;
      for (const k in e.c) {
        const m = e.c[k].exports;
        const mDef = m && m.default && m.__esModule ? m.default : m;
        if (mDef && mDef.displayName === "SettingsView") _1 = m;
        if (mDef && mDef.getChannel && mDef.getCategory) _2 = mDef;
      }
      ((mods, SettingsView, { getChannel }) => {
        console.log([SettingsView, getChannel, Object.keys(mods).length]);
      })(_0, _1, _2);
    },
  ]);
  webpackChunkdiscord_app.pop();
  void 0;
})();

```

Here is the actual output as HLCC will output it:
```js
(()=>{webpackChunkdiscord_app.push([[Symbol()],{},a=>{const b=a.c;let c;let d;for(const e in a.c){const f=a.c[e].exports;const g=f&&f.default&&f.__esModule?f.default:f;if(g&&g.displayName==="SettingsView")c=f;if(g&&g.getChannel&&g.getCategory)d=g}((a,b,{getChannel:c})=>{console.log([b,c,Object.keys(a).length])})(b,c,d)}]);webpackChunkdiscord_app.pop();void 0})()
```