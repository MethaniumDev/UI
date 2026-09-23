import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "../../cmp/button";
import { Label } from "../../cmp/label";
import { convertThemeIcon } from "../icon";

export function IconPicker({
  logo,
  onLogoChange,
}: {
  logo: string;
  onLogoChange: (logo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await convertThemeIcon(file);
      setError("");
      onLogoChange(dataUrl);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not process the image.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Icon</Label>
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="Theme icon"
          className="size-16 shrink-0 rounded-md border border-border bg-muted/40 object-contain"
        />
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => inputRef.current?.click()}
          >
            <Upload data-icon="inline-start" />
            Upload image
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
