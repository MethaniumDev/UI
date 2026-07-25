import Link from "../link";
import CreateScreen, { StorageDestoryer } from "./util";

/**
 * Executes Screen.
 * @param props Parameter props.
 * @returns unknown.
 */
export default function Screen(props: { error: string; description: string }) {
  return (
    <CreateScreen>
      <p className="text-base font-semibold">{props.error}</p>
      <p className="pt-4 text-sm w-1/2 text-center text-muted-foreground pb-8">
        {props.description}
      </p>
      <Link label="status.methanium.net" link="https://status.methanium.net" />
      <StorageDestoryer />
    </CreateScreen>
  );
}
