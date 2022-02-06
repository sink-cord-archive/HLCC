hlccInject(
  [
    hlccAll(),
    hlccByDName("SettingsView"),
    hlccByProps("getChannel", "getCategory"),
  ],
  (mods, SettingsView, { getChannel }) => {
    console.log([SettingsView, getChannel, Object.keys(mods).length]);
  }
);
