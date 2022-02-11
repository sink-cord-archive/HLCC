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

## `hlccByPredicate((any) => bool, number?)`
Finds a module by a test function. Optionally indexes - see above.
```js
hlccByPredicate(m => Array.isArray(m?._Messages) /* , 1 */);
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

## A minimal (ish!) annotated example
```js
hlccInject(
  [
    hlccAll(),
    hlccByDName("Header"),
    hlccByProps("_dispatcher", 50),
  ],
  (mods, Header, store) => {
    console.log(Object.keys(mods).length, Head, store);
  }
);
```
```js
{
  // help out minifiers in compressing the compiled snippets
  const _w = webpackChunkdiscord_app;

  // initialise variables - these are the "args" you asked for in your callback
  let mods, header, store;

  // inject into webpack
  _w.push([
    [Symbol()],
    {},
    (e) => {
      // e.c now contains the raw module list
      // mods (1st find) wants the raw modules
      mods = e.c;
      // the module find at index 2 (3rd one) uses indexing instead of first
      // so store the counter here
      let _i2 = 0;

      // begin looping through modules
      for (const k in e.c) {
        // get the raw module
        const m = e.c[k].exports;
        // if the module has a default export, use that instead (except for display names)
        const mDef = m?.default && m.__esModule ? m.default : m;
        // match default.displayName, and only match once (&& !header)
        if (mDef?.displayName === "Header" && !header) header = m;
        // match default._dispatcher, and only if index is 50 (also increment)
        if (mDef?._dispatcher && _i2++ === 50) store = mDef;
      }
    },
  ]);

  // dont memory leak
  _w.pop();

  // this is the code the user passed in the callback! Here just logs
  console.log(Object.keys(mods).length, header, store);

  // prevents the value of the last expr being printed when you paste into devtools
  void 0;
}
```