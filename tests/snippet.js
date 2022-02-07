hlccInject(
  [
    hlccByProps("_dispatcher", 50),
    hlccByProps("open"),
    hlccByDName("Header", 1),
    hlccAll(),
  ],
  (store, settings, Header, mods) => {
    if (Object.keys(mods).length % 2 === 0)
      console.log("Even number of modules");
    else console.log("Odd number of modules");

    console.log(store, Header, settings);
  }
);
