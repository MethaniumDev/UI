import { BUILT_IN_THEME_IDS } from "./theme/ids.js";

export type MethaniumUiPluginOptions = {
  defaultThemeId: string;
};

export type MethaniumUiPlugin = {
  name: "methanium-ui";
  config: () => {
    define: Record<string, string>;
  };
};

export function methaniumUi(
  options: MethaniumUiPluginOptions,
): MethaniumUiPlugin {
  if (!options.defaultThemeId.trim()) {
    throw new Error("methaniumUi defaultThemeId must not be empty");
  }
  if (!BUILT_IN_THEME_IDS.includes(options.defaultThemeId)) {
    throw new Error(
      `methaniumUi defaultThemeId must be one of: ${BUILT_IN_THEME_IDS.join(", ")}`,
    );
  }

  return {
    name: "methanium-ui",
    config() {
      return {
        define: {
          __METHANIUM_UI_DEFAULT_THEME_ID__: JSON.stringify(
            options.defaultThemeId,
          ),
        },
      };
    },
  };
}
