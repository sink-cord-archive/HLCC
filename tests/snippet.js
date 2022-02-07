hlccInject(
  [
    hlccAll(),
    hlccByDName("SettingsView"),
    hlccByProps("getChannel", "getCategory"),
  ],
  (mods, SettingsView, channels) => {
    console.log([SettingsView, channels.getChannel, Object.keys(mods).length]);
  }
);
