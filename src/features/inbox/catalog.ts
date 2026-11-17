import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ClientStores, Immutable, RoomSnapshot } from "../../core/stores";
import {
  type AdapterRooms,
  adapterRoomsSnapshot,
  subscribeAdapterRooms,
  watchAdapterRooms,
} from "../adapters/liveRooms";

/** Re-renders on any change to the catalog order or to one of its rooms. */
export function useKakaoSnapshots(
  stores: ClientStores,
  enabled: boolean,
): Immutable<RoomSnapshot>[] {
  const version = useRef(0);
  const [subscribe] = useState(() => (listener: () => void) => {
    let rooms: (() => void)[] = [];
    const changed = () => {
      version.current += 1;
      listener();
    };
    const watch = () => {
      for (const unsubscribe of rooms) unsubscribe();
      rooms = stores
        .getSnapshot("rooms.order")
        .map((id) => stores.subscribe(`room.${id}`, changed));
    };
    const order = stores.subscribe("rooms.order", () => {
      watch();
      changed();
    });
    watch();
    return () => {
      order();
      for (const unsubscribe of rooms) unsubscribe();
    };
  });
  const cache = useRef<{
    version: number;
    enabled: boolean;
    value: Immutable<RoomSnapshot>[];
  }>({ version: -1, enabled, value: [] });
  const read = useCallback(() => {
    const held = cache.current;
    if (held.version === version.current && held.enabled === enabled)
      return held.value;
    const value = enabled
      ? stores.getSnapshot("rooms.order").flatMap((id) => {
          const snapshot = stores.getSnapshot(`room.${id}`);
          return snapshot ? [snapshot] : [];
        })
      : [];
    cache.current = { version: version.current, enabled, value };
    return value;
  }, [stores, enabled]);
  return useSyncExternalStore(subscribe, read, read);
}

/** Every adapter's rooms from the shared live store, watched while this list is shown. */
export function useAdapterRooms(
  ids: string[],
): ReadonlyMap<string, AdapterRooms> {
  const key = ids.join(",");
  useEffect(() => watchAdapterRooms(key ? key.split(",") : []), [key]);
  return useSyncExternalStore(
    subscribeAdapterRooms,
    adapterRoomsSnapshot,
    adapterRoomsSnapshot,
  );
}
