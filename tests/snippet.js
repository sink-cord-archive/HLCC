hlccInject(
  [
    hlccByProps("_dispatcher", 50),
    hlccByDName("Header"),
    hlccByProps("open", 3),
    hlccAll(),
  ],
  (store, Header, settings, mods) => {
    if (Object.keys(mods).length % 2 === 0)
      console.log("Even number of modules");
    else console.log("Odd number of modules");

    console.log(store, Header, settings);
  }
);
