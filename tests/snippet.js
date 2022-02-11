hlccInject(
  [
    hlccByProps("_dispatcher", 50), // 51st Flux store found
    hlccByProps("open"), // first module with `open`
    hlccByDName("Header", 1), // 2nd `Header` component
    hlccAll(),
    hlccByPredicate(
      (m) => m.type?.toString().indexOf("MESSAGE_A11Y_ROLE_DESCRIPTION") > -1
    ),
  ],
  (store, settings, Header, mods, Message) => {
    if (Object.keys(mods).length % 2 === 0)
      console.log("Even number of modules");
    else console.log("Odd number of modules");

    console.log(store, settings, Header, Message);
  }
);
