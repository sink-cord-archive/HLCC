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