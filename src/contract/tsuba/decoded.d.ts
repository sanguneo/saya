// Generated from contracts/tsuba.openapi.json by bun run contract:generate. Do not edit.
export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness, with no token, so a proxy can be checked apart from authentication. */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What this adapter can do, and the limits its messenger enforces.
         * @description Like an AI API listing its models and what each supports. A client checks `contract.version` against its own range before anything else. `revision` changes whenever anything else in the answer does, so a client can tell a held answer is stale. The declaration is network-wide; a room where it differs says so in `Room.features`.
         */
        get: operations["capabilities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/icon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The provider's icon, for a client to draw beside its name.
         * @description Answered when `provider.icon` is present in `GET /capabilities`; otherwise `404 NOT_FOUND`. The icon is SVG, PNG or WebP and is drawn as an image, never as a document: the answer always carries `content-security-policy: default-src 'none'; sandbox` and `x-content-type-options: nosniff`, and an adapter refuses at start an SVG with scripts, event handlers or references outside itself. `provider.icon` changes whenever the bytes do, so a client may ask `/icon?v=<provider.icon>` and keep the answer in a private cache; the query is ignored.
         */
        get: operations["icon"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rooms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The conversations the account can see, as its own client lists them.
         * @description Feature `rooms.list`. Rooms come in the order the messenger's own client shows them (pinned first, then by latest activity). An adapter may stop at a cap of its own; `complete: false` says it did and that more rooms exist. A room whose features differ from the declaration carries `features`.
         */
        get: operations["rooms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A room's messages, oldest first.
         * @description Feature `messages.read`. Without `before`, the newest `limit` messages; with it, the `limit` messages just before that id. `hasEarlier` says whether older ones exist. `before` paging is answered only when the feature declares `paging: before-id`; a `limit` above the feature's `maxLimit` is `400 INVALID_REQUEST`.
         */
        get: operations["messages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The bytes of an attachment or picture.
         * @description Feature `attachments.read`. `id` is the `id` of an entry in a message's `attachments`, an optional room's `avatar`, or a message's `senderAvatar` when the adapter also declares `avatars.read`. Room.avatar does not require or imply avatars.read. The bytes are someone else's, so the answer is made safe to open at the client's own origin: `content-security-policy: default-src 'none'; sandbox` and `x-content-type-options: nosniff` always; the attachment's own type, served `inline`, only when it is one a browser draws or plays without running anything (JPEG, PNG, GIF, WebP and AVIF images; MP4, WebM and Ogg video; MPEG, Ogg, MP4, AAC, WebM, WAV and FLAC audio); anything else as `application/octet-stream` and `attachment`. An id answers the same bytes for as long as it answers at all (a message whose file is replaced, or a sender or room whose picture changes, carries a new id), so the answer may be kept in a private cache.
         */
        get: operations["media"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * New messages as Server-Sent Events.
         * @description Feature `messages.stream`. The same shape the KakaoTalk cores use: `ready` once, then `message` per message with a `cursor` after the messages it covers, `ping` while quiet, and `error` once before the stream ends. With `resume: cursor`, a reconnection hands back the last cursor as repeated `since=<roomId>:<messageId>` (split at the last colon) and the adapter sends what each named room received after that id before going live; a room not named starts from now. A cursor the adapter cannot honour is refused, never downgraded to now. An `error` event carries any code a read can answer. Besides these, an adapter sends the events its `messages.stream` lists in `events`: `message.edited`, the whole message as it now is after an edit or any other change to it; `message.deleted`, the ids of messages gone from a room, sent for the deletions the adapter can place in a room, so its absence is no proof that a message still exists; and `reactions.updated`, a message's reactions as they now are. Resume replays `message` only. A client skips an event this version does not list; names reserved for later versions are in tsuba's `docs/contract.md`.
         */
        get: operations["stream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send text to a room.
         * @description Feature `messages.send`. Sends share the adapter's one write line: one at a time, at most four admitted, and the next is `429 RATE_LIMITED` having changed nothing. With `messages.reply`, `replyTo` names the message in the same room this one answers; an adapter without it answers `replyTo` with `501 NOT_SUPPORTED`. Text that is empty or longer than the feature's `maxLength` code points is `400 INVALID_REQUEST`. With `receipt: stored` the answer carries the message the messenger stored. Every error but `INTERNAL` means nothing was sent; a send whose outcome is uncertain is never retried by the adapter.
         */
        post: operations["send"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send one file to a room.
         * @description Feature `attachments.send`. A `multipart/form-data` body with one file part named `file`, the `roomId`, and optionally `caption` and `replyTo`; no other part, and no part twice. The file part's name and type are the file's. The adapter sends a picture or video its messenger shows inline as one, and anything else as a file. Uploads share the adapter's one write line with `POST /send`: one at a time, at most four admitted, and the next is `429 RATE_LIMITED` having changed nothing. A file larger than the feature's `maxBytes` is `400 INVALID_REQUEST`, refused before it is read whole when the length says so, and so is a file whose type is not among the feature's `types` when it declares them. A caption is `400 INVALID_REQUEST` where the feature declares `caption: false` or past its `captionMaxLength` code points. `replyTo` is as for `POST /send`, `501 NOT_SUPPORTED` without `messages.reply`. Every error but `INTERNAL` means nothing was sent; an upload whose outcome is uncertain is never retried by the adapter.
         */
        post: operations["upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/edit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Replace the text of a message this account sent.
         * @description Feature `messages.edit`. Text that is empty or longer than the feature's `maxLength` code points is `400 INVALID_REQUEST`, and so is text the message already has; a message older than `maxAgeSeconds`, or one the messenger does not let this account edit, is `403 FORBIDDEN`. The answer carries the message as the messenger now stores it. Edits share the write line with `/send`, and an edit whose outcome is uncertain is never retried.
         */
        post: operations["edit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Delete a message.
         * @description Feature `messages.delete`. With the feature's `forEveryone: true` the message is removed for every participant, otherwise only for this account. A message the messenger does not let this account delete is `403 FORBIDDEN`; one this account cannot see is `404 NOT_FOUND`. Deletes share the write line with `/send`, and a delete whose outcome is uncertain is never retried.
         */
        post: operations["delete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/react": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Set this account's reactions on a message.
         * @description Feature `reactions.send`. `emojis` becomes this account's reactions on the message, replacing what it had; `[]` removes them. More than `maxPerMessage`, or the same emoji twice, is `400 INVALID_REQUEST`; an emoji the room does not allow is `403 FORBIDDEN`. The answer carries the message's reactions afterwards. Reactions share the write line with `/send`.
         */
        post: operations["react"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Mark a room read up to a message.
         * @description Feature `read.mark`. Marks the room read up to and including `messageId`, as the messenger's own client does when a person reads it; the messenger may tell the other participants. Marking what is already read changes nothing and succeeds. Read marks share the write line with `/send`.
         */
        post: operations["read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        PositiveInteger: number;
        /**
         * @description Known codes, each with its one HTTP status. The set grows: keep a default branch.
         *
         *     - `UNAUTHORIZED` 401: the bearer token is missing or wrong.
         *     - `INVALID_REQUEST` 400: the request is malformed or outside a declared limit.
         *     - `NOT_FOUND` 404: no such route, room, message or attachment for this account.
         *     - `METHOD_NOT_ALLOWED` 405: the route answers another method, named in `Allow`.
         *     - `NOT_SUPPORTED` 501: the adapter does not declare the route's feature.
         *     - `RATE_LIMITED` 429: the adapter's line is full or the messenger asked it to slow down.
         *     - `BUSY` 503: the adapter holds as many streams as it will.
         *     - `INTERNAL` 500: the adapter failed; the message says nothing about the account. On a write, the outcome is unknown.
         *     - `FORBIDDEN` 403: the messenger does not let this account do this here (a channel it cannot post in, a group that restricted or banned it).
         *     - `REAUTH_REQUIRED` 503: the messenger no longer accepts the adapter's session (signed out, revoked or expired); a person signs in again where the adapter runs.
         */
        ErrorCode: string;
        ErrorEnvelope: {
            /** @constant */
            ok: false;
            error: {
                code: components["schemas"]["ErrorCode"];
                message: string;
            };
        };
        Health: {
            /** @constant */
            ok: true;
        };
        Capabilities: {
            /** @constant */
            ok: true;
            contract: {
                /** @description The `info.version` of this document the adapter answers. A client checks it against its own caret range before anything else. */
                version: string;
            };
            adapter: {
                name: string;
                /** @description The adapter's own release, independent of the contract version. */
                version: string;
            };
            provider: {
                /** @description Stable, e.g. `telegram`. Do not infer features from it; read `features`. */
                id: string;
                /** @description For display. */
                name: string;
                /** @description Present when `GET /icon` answers the provider's icon: an opaque version of its bytes, changing whenever they do. Absent when the adapter has none; a client then draws its own mark. */
                icon?: string;
            };
            account: {
                /** @description `user`: the adapter acts as the person, seeing what their own client sees. `bot`: a bot account, seeing only where it was added. `official`: an official or business account. A client says which it is showing. */
                kind: string;
            };
            /** @description Opaque content hash of the declaration. */
            revision: string;
            features: components["schemas"]["Features"];
        };
        /** @description Supported features by id, each with the limits its messenger enforces. Absent means unsupported. Ids under `x-<provider>.` are provider extensions; ignore any id you do not know. */
        Features: {
            "rooms.list"?: components["schemas"]["FeatureRoomsList"];
            "messages.read"?: components["schemas"]["FeatureMessagesRead"];
            "messages.stream"?: components["schemas"]["FeatureMessagesStream"];
            "messages.send"?: components["schemas"]["FeatureMessagesSend"];
            "messages.reply"?: components["schemas"]["FeatureMessagesReply"];
            "messages.edit"?: components["schemas"]["FeatureMessagesEdit"];
            "messages.delete"?: components["schemas"]["FeatureMessagesDelete"];
            "reactions.read"?: components["schemas"]["FeatureReactionsRead"];
            "reactions.send"?: components["schemas"]["FeatureReactionsSend"];
            "read.mark"?: components["schemas"]["FeatureReadMark"];
            "typing.send"?: components["schemas"]["FeatureTypingSend"];
            "threads.read"?: components["schemas"]["FeatureThreadsRead"];
            "attachments.read"?: components["schemas"]["FeatureAttachmentsRead"];
            "avatars.read"?: components["schemas"]["FeatureAvatarsRead"];
            "attachments.send"?: components["schemas"]["FeatureAttachmentsSend"];
        } & {
            [key: string]: Record<string, never>;
        };
        /** @description List the conversations the account can see: `GET /rooms`. */
        FeatureRoomsList: Record<string, never>;
        /** @description Read a room's messages, oldest first: `GET /messages`. */
        FeatureMessagesRead: {
            /** @description `none`: only the newest window. `before-id`: earlier pages before a message id. */
            paging: string;
            /** @description Most messages one read returns. */
            maxLimit: components["schemas"]["PositiveInteger"];
        };
        /** @description Receive new messages over SSE: `GET /stream`. */
        FeatureMessagesStream: {
            /** @description `none`: a reconnection starts from now. `cursor`: a reconnection resumes from per-room cursors without a gap. */
            resume: string;
            /** @description The events this adapter sends besides `ready`, `message`, `cursor`, `ping` and `error`: any of `message.edited`, `message.deleted` and `reactions.updated`, or a provider's own `x-<provider>.` events. Absent means none of them. Resume replays `message` only: an edit, a deletion or a reaction missed while disconnected is not sent again, so a client that must be exact rereads `/messages`. */
            events?: string[];
        };
        /** @description Send text: `POST /send`. */
        FeatureMessagesSend: {
            /** @description Longest text the messenger accepts, in Unicode code points. */
            maxLength: components["schemas"]["PositiveInteger"];
            /** @description `accepted`: the messenger took the request, nothing more is known. `stored`: the answer carries the id of the message the messenger stored. */
            receipt: string;
        };
        /** @description Send a message as a reply to another in the same room: `replyTo` on `POST /send`. Declared only beside `messages.send`. */
        FeatureMessagesReply: Record<string, never>;
        /** @description Replace the text of a message this account sent: `POST /edit`. */
        FeatureMessagesEdit: {
            /** @description Longest text the messenger accepts in an edit, in Unicode code points. */
            maxLength: components["schemas"]["PositiveInteger"];
            /** @description How long after sending a message can still be edited. Absent when the messenger sets no age limit. */
            maxAgeSeconds?: components["schemas"]["PositiveInteger"];
        };
        /** @description Delete a message: `POST /delete`. The messenger decides whose messages this account may delete; where it does not let it, the answer is `403 FORBIDDEN`. */
        FeatureMessagesDelete: {
            /** @description Whether deletion removes it for every participant rather than only this account. */
            forEveryone: boolean;
        };
        /** @description Messages carry their reactions: `Message.reactions`, and `reactions.updated` on the stream when `messages.stream` lists it in `events`. */
        FeatureReactionsRead: Record<string, never>;
        /** @description Set this account's reactions on a message: `POST /react`. Declared only beside `reactions.read`. */
        FeatureReactionsSend: {
            /** @description Most reactions this account may leave on one message. Absent when the messenger sets no limit. */
            maxPerMessage?: components["schemas"]["PositiveInteger"];
        };
        /** @description Mark a room read up to a message, as the messenger's own client does when a person reads it: `POST /read`. */
        FeatureReadMark: Record<string, never>;
        /** @description Reserved. Show that the account is typing: `POST /typing`. */
        FeatureTypingSend: Record<string, never>;
        /** @description Reserved. Read a thread under a message: `GET /thread`. A thread is not a room; a room is the conversation. */
        FeatureThreadsRead: Record<string, never>;
        /** @description Messages carry `attachments`, and `GET /media` answers their bytes. */
        FeatureAttachmentsRead: Record<string, never>;
        /** @description Messages carry their sender's profile picture: `Message.senderAvatar`, an id `GET /media` answers. Declared only beside `attachments.read`, whose route serves the bytes. */
        FeatureAvatarsRead: Record<string, never>;
        /** @description Send one file: `POST /upload`. */
        FeatureAttachmentsSend: {
            /** @description Largest file the adapter takes from this account, in bytes: the smaller of the messenger's limit and the adapter's own. */
            maxBytes: components["schemas"]["PositiveInteger"];
            /** @description Whether a file can carry text with it. */
            caption: boolean;
            /** @description With `caption: true`, and only then: the longest caption the messenger accepts, in Unicode code points. */
            captionMaxLength?: components["schemas"]["PositiveInteger"];
            /** @description When present, the only media types the adapter sends, as lowercase `type/subtype` without parameters: a file whose part carries any other type is refused. Absent means any type. A client offers only these when a person picks a file. */
            types?: string[];
            /** @description As for `messages.send`: `stored` means the answer carries the message the messenger stored. */
            receipt: string;
        };
        /** @description A room's own features where they differ from the declaration. A key replaces the declared value of that feature for this room, and `false` means the feature is unsupported here; an absent key leaves the declaration as it is. Only declared features appear: a room narrows the declaration and never adds to it. */
        RoomFeatures: {
            "rooms.list"?: false | components["schemas"]["FeatureRoomsList"];
            "messages.read"?: false | components["schemas"]["FeatureMessagesRead"];
            "messages.stream"?: false | components["schemas"]["FeatureMessagesStream"];
            "messages.send"?: false | components["schemas"]["FeatureMessagesSend"];
            "messages.reply"?: false | components["schemas"]["FeatureMessagesReply"];
            "messages.edit"?: false | components["schemas"]["FeatureMessagesEdit"];
            "messages.delete"?: false | components["schemas"]["FeatureMessagesDelete"];
            "reactions.read"?: false | components["schemas"]["FeatureReactionsRead"];
            "reactions.send"?: false | components["schemas"]["FeatureReactionsSend"];
            "read.mark"?: false | components["schemas"]["FeatureReadMark"];
            "typing.send"?: false | components["schemas"]["FeatureTypingSend"];
            "threads.read"?: false | components["schemas"]["FeatureThreadsRead"];
            "attachments.read"?: false | components["schemas"]["FeatureAttachmentsRead"];
            "avatars.read"?: false | components["schemas"]["FeatureAvatarsRead"];
            "attachments.send"?: false | components["schemas"]["FeatureAttachmentsSend"];
        } & {
            [key: string]: false | Record<string, never>;
        };
        /** @description A conversation. A key that does not apply is absent, never null or false. */
        Room: {
            /** @description Opaque. Compare, store and send it back as the string it is; never as a number. */
            id: string;
            /** @description What the messenger's own client shows as the room's name. */
            title: string;
            /** @description Optional opaque GET /media id for the room picture, supported when attachments.read is declared and enabled for this room. Changes when the picture changes; the same id always serves the same bytes while available. Omit for private, missing or failed picture lookups. Never a raw messenger URL. Does not require or imply avatars.read, which remains Message.senderAvatar. */
            avatar?: string;
            /** @description `direct`: one other account (person or bot). `group`: several members who can all write. `channel`: a broadcast most members only read. */
            kind: string;
            /** @description The messenger's own unread count for this account. */
            unread: number;
            /**
             * Format: date-time
             * @description When the newest message arrived.
             */
            lastActivityAt?: string;
            /** @description The newest message, for a list preview. */
            lastMessage?: {
                /** @description At most its first 200 code points. Empty when the message has no text (a photo, a sticker). */
                text: string;
                fromMe: boolean;
            };
            features?: components["schemas"]["RoomFeatures"];
        };
        RoomsAnswer: {
            /** @constant */
            ok: true;
            rooms: components["schemas"]["Room"][];
            /** @description `false` when the adapter stopped at its own cap and more rooms exist. */
            complete: boolean;
        };
        /** @description A file a message carries. A key that does not apply, or that the messenger does not say, is absent. */
        Attachment: {
            /** @description Opaque; `GET /media?id=` answers its bytes. */
            id: string;
            /** @description `file`: something to download. `image`: a still picture. `video`. `audio`: music or a recording. `voice`: a voice note. `sticker`. `animation`: a looping silent clip, such as a GIF. */
            kind: string;
            /** @description The file name it was sent with. Somebody else chose it: show it, never use it as a path. */
            name?: string;
            /** @description As the messenger reports it. `GET /media` serves a type by its own rule, not by this. */
            mimeType?: string;
            /** @description In bytes. */
            size?: number;
            /** @description In pixels. */
            width?: components["schemas"]["PositiveInteger"];
            /** @description In pixels. */
            height?: components["schemas"]["PositiveInteger"];
            durationSeconds?: number;
        };
        /** @description One reaction on a message: an emoji, how many accounts chose it, and whether this account is one of them. Only reactions the adapter can name as a Unicode emoji appear; a messenger's custom or paid reactions may be left out. */
        Reaction: {
            /** @description The emoji as Unicode text, exactly as `POST /react` takes it back. */
            emoji: string;
            /** @description How many accounts chose it. */
            count: components["schemas"]["PositiveInteger"];
            /** @description Whether this account chose it. */
            mine: boolean;
        };
        /** @description A key that does not apply is absent. */
        Message: {
            /** @description Opaque; send it back as is. */
            id: string;
            roomId: string;
            senderId?: string;
            /** @description The name the messenger shows for the sender (a channel's own title for its posts). */
            sender: string;
            /** @description The sender's profile picture as the messenger shows it: an opaque id for `GET /media`, like an attachment's. A new picture carries a new id. Present only when the adapter declares `avatars.read` and the sender has a picture it can serve; absent, a client draws its own placeholder. */
            senderAvatar?: string;
            /** @description Empty when the message carries no text. */
            text: string;
            /** @description `media`: a photo, file, sticker, voice and so on, with `text` its caption; its files are in `attachments` when the adapter declares `attachments.read`. A link preview is not media. `service`: a join, a title change and the like. */
            kind: string;
            /** Format: date-time */
            sentAt: string;
            /** Format: date-time */
            editedAt?: string;
            fromMe: boolean;
            /** @description The id of the message this replies to. */
            replyTo?: string;
            /** @description Shared by messages the messenger shows as one album (such as a Telegram media group): they come from one sender and are consecutive in the room, so a client may draw them as one. Each stays its own message for replies, reactions, edits and deletion. Absent when the message stands alone. */
            groupId?: string;
            /** @description The files the message carries, in the order the messenger shows them. Present only when the adapter declares `attachments.read` and the message carries a file it can describe. */
            attachments?: components["schemas"]["Attachment"][];
            /** @description The reactions on the message, in the order the messenger shows them. Present only when the adapter declares `reactions.read` and the message has reactions it can name. */
            reactions?: components["schemas"]["Reaction"][];
        };
        MessagesAnswer: {
            /** @constant */
            ok: true;
            messages: components["schemas"]["Message"][];
            hasEarlier: boolean;
        };
        /** @description Room id to the id of the last message the stream sent for it. */
        Cursor: {
            [key: string]: string;
        };
        StreamReady: {
            /** @constant */
            ok: true;
            resumed: boolean;
            cursor: components["schemas"]["Cursor"];
        };
        StreamMessage: {
            /** @constant */
            ok: true;
            message: components["schemas"]["Message"];
        };
        StreamMessagesDeleted: {
            /** @constant */
            ok: true;
            roomId: string;
            /** @description Messages gone from the room. */
            messageIds: string[];
        };
        StreamReactionsUpdated: {
            /** @constant */
            ok: true;
            roomId: string;
            messageId: string;
            /** @description The message's reactions as they now are; empty when it has none the adapter can name. */
            reactions: components["schemas"]["Reaction"][];
        };
        StreamCursor: {
            /** @constant */
            ok: true;
            cursor: components["schemas"]["Cursor"];
        };
        StreamPing: {
            /** @constant */
            ok: true;
        };
        SendRequest: {
            roomId: string;
            text: string;
            /** @description With `messages.reply`: the id of the message in the same room this one answers. An adapter that does not declare `messages.reply` answers it with `501 NOT_SUPPORTED` and sends nothing. */
            replyTo?: string;
        };
        SendAnswer: {
            /** @constant */
            ok: true;
            message: components["schemas"]["Message"];
        };
        UploadRequest: {
            roomId: string;
            /**
             * Format: binary
             * @description Exactly one file. Its part's file name and content type are the file's.
             */
            file: string;
            /** @description With `caption: true`: text sent with the file, at most `captionMaxLength` code points. */
            caption?: string;
            /** @description With `messages.reply`: as `SendRequest.replyTo`. */
            replyTo?: string;
        };
        EditRequest: {
            roomId: string;
            messageId: string;
            /** @description The whole new text, at most the feature's `maxLength` code points. */
            text: string;
        };
        EditAnswer: {
            /** @constant */
            ok: true;
            /** @description The message as the messenger now stores it. */
            message: components["schemas"]["Message"];
        };
        DeleteRequest: {
            roomId: string;
            messageId: string;
        };
        ReactRequest: {
            roomId: string;
            messageId: string;
            /** @description This account's reactions on the message after the write, replacing whatever it had; `[]` removes them. At most the feature's `maxPerMessage`. */
            emojis: string[];
        };
        ReactAnswer: {
            /** @constant */
            ok: true;
            /** @description The message's reactions after the write; empty when it has none the adapter can name. */
            reactions: components["schemas"]["Reaction"][];
        };
        ReadRequest: {
            roomId: string;
            /** @description The newest message read: it and every message before it in the room are marked read. */
            messageId: string;
        };
        /** @description The write was performed. */
        Done: {
            /** @constant */
            ok: true;
        };
    };
    responses: {
        /** @description `INVALID_REQUEST`: malformed, or outside a declared limit; nothing changed. */
        InvalidRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `UNAUTHORIZED`: missing or wrong bearer token. */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `FORBIDDEN`: the messenger does not let this account do this here; nothing changed. */
        Forbidden: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `NOT_FOUND`: no such room, message or attachment for this account. */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `RATE_LIMITED`: the adapter's line is full or the messenger asked it to slow down; nothing changed. */
        RateLimited: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `INTERNAL`: the adapter failed; the message says nothing about the account. On a write, the outcome is unknown. */
        Internal: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `NOT_SUPPORTED`: this adapter does not declare the route's feature. */
        NotSupported: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
        /** @description `REAUTH_REQUIRED`: the messenger no longer accepts the adapter's session; nothing changed. */
        ReauthRequired: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The adapter is answering. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
        };
    };
    capabilities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The declaration. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Capabilities"];
                };
            };
            401: components["responses"]["Unauthorized"];
        };
    };
    icon: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The icon. */
            200: {
                headers: {
                    /** @description `image/svg+xml`, `image/png` or `image/webp`. */
                    "Content-Type"?: string;
                    /** @description `default-src 'none'; sandbox`. */
                    "Content-Security-Policy"?: string;
                    /** @description `nosniff`. */
                    "X-Content-Type-Options"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "image/*": string;
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
        };
    };
    rooms: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The rooms. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoomsAnswer"];
                };
            };
            401: components["responses"]["Unauthorized"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    messages: {
        parameters: {
            query: {
                roomId: string;
                /** @description At most the feature's `maxLimit`; more is a 400. */
                limit?: number;
                /** @description A message id from an earlier answer. */
                before?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The messages. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessagesAnswer"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    media: {
        parameters: {
            query: {
                id: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The file, streamed. */
            200: {
                headers: {
                    /** @description The attachment's type when it is on the inline list above; otherwise `application/octet-stream`. */
                    "Content-Type"?: string;
                    /** @description `inline` or `attachment`, with the name, when there is one, in `filename*` (UTF-8, percent-encoded) beside a printable-ASCII `filename`. Somebody else chose the name: it is only ever a download name. */
                    "Content-Disposition"?: string;
                    /** @description `default-src 'none'; sandbox`. */
                    "Content-Security-Policy"?: string;
                    /** @description `nosniff`. */
                    "X-Content-Type-Options"?: string;
                    /** @description `private, max-age=86400`. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    stream: {
        parameters: {
            query?: {
                since?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description An event stream. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            501: components["responses"]["NotSupported"];
            /** @description `BUSY`: the adapter already holds as many streams as it will (8). */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    send: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendRequest"];
            };
        };
        responses: {
            /** @description Stored. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendAnswer"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    upload: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["UploadRequest"];
            };
        };
        responses: {
            /** @description Sent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendAnswer"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    edit: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EditRequest"];
            };
        };
        responses: {
            /** @description Edited. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EditAnswer"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteRequest"];
            };
        };
        responses: {
            /** @description Deleted. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Done"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    react: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReactRequest"];
            };
        };
        responses: {
            /** @description Set. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReactAnswer"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReadRequest"];
            };
        };
        responses: {
            /** @description Marked. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Done"];
                };
            };
            400: components["responses"]["InvalidRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            429: components["responses"]["RateLimited"];
            500: components["responses"]["Internal"];
            501: components["responses"]["NotSupported"];
            503: components["responses"]["ReauthRequired"];
        };
    };
}
