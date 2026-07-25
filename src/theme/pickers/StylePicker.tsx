import * as React from "react";

import { Base16Picker } from "./Base16Picker";
import { BorderRadiusPicker } from "./BorderRadiusPicker";
import { CustomCssPicker } from "./CustomCssPicker";
import { PolarityPicker } from "./PolarityPicker";
import { PrimaryPicker } from "./PrimaryPicker";
import { TintPicker } from "./TintPicker";

type StyleCategoryProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function StyleCategory({ title, children }: StyleCategoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export function StylePicker() {
  return (
    <div className="flex w-full flex-col gap-5">
      <PolarityPicker />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),15rem))] gap-8">
        <div className="flex shrink-0 flex-col gap-8">
          <StyleCategory title="Tint">
            <TintPicker />
          </StyleCategory>

          <StyleCategory title="Primary Color">
            <PrimaryPicker />
          </StyleCategory>

          <StyleCategory title="Border Radius">
            <BorderRadiusPicker />
          </StyleCategory>
        </div>

        <div className="shrink-0">
          <StyleCategory title="Base16">
            <Base16Picker />
          </StyleCategory>
        </div>

        <div className="shrink-0">
          <StyleCategory title="Custom CSS">
            <CustomCssPicker />
          </StyleCategory>
        </div>
      </div>
    </div>
  );
}
