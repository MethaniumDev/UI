import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EditableList,
  LabeledSwitch,
} from "@nonanium/ui";

export function SettingsShowcase() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [blockedWords, setBlockedWords] = useState(["spoilers", "pineapple"]);

  return (
    <section className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose which updates appear in the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LabeledSwitch
            id="settings-notifications"
            label="Enable notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content filters</CardTitle>
          <CardDescription>Hide posts containing these words.</CardDescription>
        </CardHeader>
        <CardContent>
          <EditableList
            label="Blocked words"
            items={blockedWords}
            parseItem={(value) => value}
            onItemsChange={setBlockedWords}
          />
        </CardContent>
      </Card>
    </section>
  );
}
