import { BUILT_IN_THEME_IDS } from "./theme/ids.js";

export type NonaniumUiPluginOptions = {
  defaultThemeId: string;
};

export type NonaniumUiPlugin = {
  name: "nonanium-ui";
  config: () => {
    define: Record<string, string>;
  };
};

export function nonaniumUi(
  options: NonaniumUiPluginOptions,
): NonaniumUiPlugin {
  if (!options.defaultThemeId.trim()) {
    throw new Error("nonaniumUi defaultThemeId must not be empty");
  }
  if (!BUILT_IN_THEME_IDS.includes(options.defaultThemeId)) {
    throw new Error(
      `nonaniumUi defaultThemeId must be one of: ${BUILT_IN_THEME_IDS.join(", ")}`,
    );
  }

  return {
    name: "nonanium-ui",
    config() {
      return {
        define: {
          __NONANIUM_UI_DEFAULT_THEME_ID__: JSON.stringify(
            options.defaultThemeId,
          ),
        },
      };
    },
  };
}
