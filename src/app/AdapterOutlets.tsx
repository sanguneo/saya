import { AdapterRoomBody, useAdapterRoom } from "../features/adapters";
import { mediaUrl, roomFeature } from "../transport/adapters";
import { RoomAvatar } from "../ui";
import styles from "./App.module.css";
import { Back } from "./Back";
import { ADAPTERS_HASH } from "./routes";

const COPY = {
  adaptersSubtitle: "메신저 연결",
  back: "목록으로",
  toAdapterList: "연결로",
  untitled: "대화",
} as const;

/** An adapter room: a header like a KakaoTalk room's, over the adapter's own thread. */
function AdapterRoomOutlet({
  adapterId,
  roomId,
  backHref,
}: {
  adapterId: string;
  roomId: string;
  backHref: string | undefined;
}) {
  const { room, capabilities } = useAdapterRoom(adapterId, roomId);
  const title = room?.title ?? COPY.untitled;
  return (
    <>
      <header className={styles.threadHead}>
        {/* Beside a list the way back is the mobile one; alone, it shows at every width. */}
        {backHref ? (
          <Back href={backHref} label={COPY.back} />
        ) : (
          <Back href={ADAPTERS_HASH} label={COPY.toAdapterList} always />
        )}
        <RoomAvatar
          name={title}
          size={40}
          images={
            capabilities.kind === "connected" &&
            roomFeature(
              capabilities.capabilities.features,
              room,
              "attachments.read",
            ) &&
            room?.avatar
              ? [mediaUrl(adapterId, room.avatar)]
              : undefined
          }
        />
        <div className={styles.identity}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {capabilities.kind === "connected"
              ? capabilities.capabilities.provider.name
              : COPY.adaptersSubtitle}
          </p>
        </div>
      </header>
      <AdapterRoomBody
        adapterId={adapterId}
        roomId={roomId}
        room={room}
        capabilities={capabilities}
      />
    </>
  );
}

export default function AdapterOutlet({
  adapterId,
  roomId,
  backHref,
}: {
  adapterId: string;
  roomId: string;
  /** The list beside this room, if any; without it the way back is 연결. */
  backHref?: string;
}) {
  return (
    <AdapterRoomOutlet
      adapterId={adapterId}
      roomId={roomId}
      backHref={backHref}
    />
  );
}
