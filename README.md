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

## Reference

### `hlccInject(ModuleFind[], Function)`
`hlccInject` takes two arguments: a list of module finds, and a callback function.
It will find the modules passed (see below), and make them available to your code.

The args of your function should correspond to the module finds:
the first module find will be the first arg passed etc.

### `hlccAll()`
A module find that just returns the raw modules object.

### `hlccByProps(...string[], number?)`
A module find that finds the module with the given props.

All arguments must be strings, except optionally the last argument,
which may be a number - if multiple modules match this specifies which to grab (index).

If left blank it is effectively 0.
```js
hlccByProps("commonProp", 5); // 6th match
hlccByProps("commonProp"); // 1st match
```

### `hlccByDName(string, number?)`
A module find that finds the module with the given display name,
useful for React components.

It, unlike `hlccByProps`, does not return the default export of the module -
this is because doing that would make patching impossible.

For indexing behaviour, see `hlccByProps` above.

```js
React.createElement(hlccByDName("Header").default);
hlccByDName("Header", 1); // i actually wanted the 2nd header module
```

## As an API
HLCC exports an (async) function to run its transform (and optionally / by default minify).

```js
import hlcc from "hlcc";
// hlcc: (input: string, shouldMinify?: boolean) => Promise<string>
const code = "hlccInject([], () => {});";
const transformed = await hlcc(code); // see below example for sample output
const unminified = await hlcc(code, false); // should be pretty self-explanatory
```

## A full example (as a build tool)
`hlcc example.js compiled.js`

This is an example input code to HLCC.

```js
hlccInject(
  [
    hlccByProps("_dispatcher", 50), // 51st Flux store found
    hlccByProps("open"), // first module with `open`
    hlccByDName("Header", 1), // 2nd `Header` component
    hlccAll(),
  ],
  (store, settings, Header, mods) => {
    if (Object.keys(mods).length % 2 === 0)
      console.log("Even number of modules");
    else console.log("Odd number of modules");

    console.log(store, settings, Header);
  }
);
```

Here is the generated code - with `--nominify` flag and run through prettier:
```js
{
  const _w = webpackChunkdiscord_app;
  let store, settings, Header, mods;
  _w.push([
    [Symbol()],
    {},
    (e) => {
      mods = e.c;
      let _i0 = 0,
        _i2 = 0;
      for (const k in e.c) {
        const m = e.c[k].exports;
        const mDef = m?.default && m.__esModule ? m.default : m;
        if (mDef?._dispatcher && _i0++ === 50) store = mDef;
        if (mDef?.open && !settings) settings = mDef;
        if (mDef?.displayName === "Header" && _i2++ === 1) Header = m;
      }
    },
  ]);
  _w.pop();
  if (Object.keys(mods).length % 2 === 0) console.log("Even number of modules");
  else console.log("Odd number of modules");
  console.log(store, settings, Header);
  void 0;
}
```

Here is the actual output as HLCC will output it:
```js
{const a=webpackChunkdiscord_app;let b,c,d,e;a.push([[Symbol()],{},a=>{e=a.c;let f=0,g=0;for(const h in a.c){const i=a.c[h].exports;const j=i?.default&&i.__esModule?i.default:i;if(j?._dispatcher&&(f++)===50)b=j;if(j?.open&&!c)c=j;if(j?.displayName==="Header"&&(g++)===1)d=i}}]);a.pop();if(Object.keys(e).length%2===0)console.log("Even number of modules");else console.log("Odd number of modules");console.log(b,c,d);void 0}
```