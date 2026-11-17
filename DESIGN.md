# DESIGN.md: saya implementation contract

The product is **saya**. Its visible label is さや (saya): in the document title,
the app heading and the first line of every introduction. The compact mark is さや
alone. The repository was called hinokami-kagura before this revision; past
evidence under `design/`, old prompts and images keep that name as history.

This is the sole implementation contract. Working evidence lives under `design/`;
where a working record and this file disagree, **this file wins**.

## Status and authority

- Contract revision: r4, 2026-09-30. r4 takes the **form** of the messenger
  tab of `bangome/xpmessenger` (its GOYO v2 renderer), as the owner asked:
  "형태는 GOYO, 컬러감은 saya 유지". Shapes, weights, spacing and arrangement
  come from there; **every colour is still a saya token** or a mix of a saya
  field with `--ink`, and no GOYO colour value is used. saya stays a web
  client; the reference being an Electron app changes nothing here. The ledge
  law and every contract truth are unchanged. What r4 changes is listed in
  "r4: the messenger arrangement" below; where it disagrees with an older
  line of this file, r4 wins.
- Contract revision: r3, 2026-09-23. r3 moves the layout to the messenger
  arrangement the owner asked for, taking Telegram Web as the reference:
  a monogram circle on every room row and in the thread header, the speaker and
  the stamp inside the bubble, own messages right-aligned, a pill composer with
  a round send button, and one pane divider instead of per-row divider slices.
  **Colours are unchanged** — the owner asked for layout only, and every token
  below still holds. The ledge law and every contract truth are unchanged.
  Superseded r2 rulings are listed in "Selected concept" below.
- Contract revision: r2, 2026-09-21. r2 adds the "Contract gaps" rulings, the
  saya name, and fixes the badge, 429 and scroll wording. Colours, layout and the
  ledge law are unchanged from r1.
- Owner approval: **APPROVED by the owner on 2026-09-21**, in conversation,
  explicitly including the two measured departures from the concept (the slate
  ledge and the darker badge red). Structural check `validate.ts`: EXIT=0,
  "Structurally complete" — which is not, and is not presented as, visual approval.
- Approved brief / direction / seeds: `design/BRIEF.md` r2, `design/DIRECTION.md`
  r3, `design/SEEDS.md` r1. All owner-confirmed in conversation on 2026-09-21.
- Selected concept, inspected: `design/seeds/C4-flat-wall.png` (1672×941).
- Selection evidence: the owner chose C3's composition, then required four
  changes; C4 implements them and the owner responded "많이 좋아진거같은데".
- Direction authored by Claude Fable 5.1 via `artistry`; concepts by
  gpt-image-2.5-sunburst. Stage plan and substitutions: `design/models.json`.

## Intent, scope and invariants

**Purpose.** A browser client for reading and replying to KakaoTalk conversations
through `kanao serve` (Windows) or `kamado serve` (macOS). This repository builds
no server and imports no core. The only contract with the outside world is
`openapi.json` 0.14.0.

**Audience.** One technical owner, running the bridge on their own machine,
catching up on missed conversation and occasionally replying.

**The conviction the interface must express.** The screen never claims more than
the contract proved, and it makes that honesty look *calm* rather than alarming.
Uncertainty here is a normal permanent resting state, not an error.

**Ranked priorities.** 1 truthfulness of state · 2 reading comfort for long
Korean text · 3 calm and distinctiveness · 4 speed of reply · 5 feature breadth.

**Anti-goals.** Not a KakaoTalk skin. Not a dashboard. No automatic retry of an
uncertain send. No token drawn, logged or screenshotted. No real nickname, room
title or message in any committed artifact.

**Scope of this contract.** `app` — the composed two-pane main screen
(SCR-ROOMS + SCR-THREAD + the composer). SCR-DIGEST, SCR-CONNECT and the stream
reconnection UI are specified here in behaviour but were deliberately not drawn.

**THE DESIGN LAW, which nothing may violate.** *One horizontal line, the ledge,
crosses the conversation pane. What the bridge has read back sits above it. What
has only been submitted sits below it. Nothing crosses until it is read back.*

### Contract truths — non-negotiable, derived from `openapi.json` 0.14.0

These are correctness requirements, not style. Violating one is a defect.

1. **Identifiers are strings.** Room and message ids exceed 2^53. Never
   `Number()`, `parseInt`, or arithmetic after `JSON.parse`. Comparison, React
   keys and URL assembly are string-only. Never render an id to the user.
2. **`submitted` is not delivered.** `SendResult.submitted` is queue acceptance.
   The response carries no message id, no nonce and no receipt, so nothing in it
   can name the row it produced. 보냈습니다 is the label of a `fromMe` row that
   was actually read back via `/context` or `/stream`; it describes that row, not
   the request. A pending item reads 입력됨 · 전달 미확인 and sits below the ledge
   until the user links it to an observed row (see "Contract gaps", G4).
   **r3: on a read-back row the word is in the accessible name only.** Its
   position above the ledge already carries the claim on screen; the word still
   ships for a reader to whom position carries nothing. The below-ledge states
   (입력됨 · 전달 미확인, 결과 확인 필요, the 429 refusal) stay visible.
3. **Never auto-retry an uncertain send.** `SEND_FAILED` means *unknown*, not
   *not sent*. Retry is a deliberate user action, always.
4. **Warn before destroying a draft.** `dryRun` first; surface `wouldClearDraft`
   in the confirmation. `clearedDraft` is reported after the fact. `dryRun` skips
   the send queue and costs no quota.
5. **`error.code` needs a default branch.** Fourteen codes today; the two builds'
   sets differ and both grow. Never branch on `error.message`.
   `PERMISSION_REQUIRED` is macOS-only and is a 30-second human fix — it gets its
   own instructional screen, not a toast.
6. **One `/stream` per client.** The cap is 8 *for the whole machine*; the ninth
   is `503 BUSY`. Open exactly one connection and fan it out to every view.
7. **Resume by cursor, not `Last-Event-ID`.** Hold the `cursor` event's
   `{roomId: logId}` and resume with repeated `?since=roomId:logId`. A room the
   cursor does not name starts at connection time — that gap is disclosed in the
   UI and filled with `/context`.
8. **Unreadable rooms are listed, never hidden and never dimmed.** Full ink.
   **r3: the row no longer states a reason.** `readable: false` still means the
   key is not in memory, but the core now opens the room on demand to get it,
   so the row is an ordinary row under the ordinary preview rule (G1). The
   thread side keeps its instructional copy for a room that still refuses.
9. **Coverage is not emptiness.** Surface `storedLocally`, `hasEarlier` and
   `reachesLatestKnown` so an empty window is never read as "this conversation
   never happened".
10. **Ambiguity is refused with candidates.** `409 AMBIGUOUS_CHAT` carries
    `candidates: Room[]`. Present the choice; never pick the first match.
11. **Messages are oldest-first everywhere.**
12. **An absent key is the negative.** `replyTo`, `mentions`, `mentionsMe`,
    `mentionsAll`, `repliesToMe` appear only when they apply — never render a "no
    mentions" state. `x-platform` members (`Room.typeCode`,
    `PERMISSION_REQUIRED`) are used when present, ignored when absent, never an error.
13. **Limits that return 400.** `limit` 1–1000 (`/context` 40, `/digest` 400);
    `highlights` 1–20 (3); send queue 4 then `429`; request deadline 30s then `408`.
14. **The token is a password.** Never drawn, never logged. Default posture: a
    proxy injects the header and the browser never holds it. If the browser must,
    memory only; `localStorage` solely on explicit user choice.
15. **`/digest` is extractive, not AI.** Its `note` says so. The UI must never
    imply a model summarised anything.

### Contract gaps: settled rulings

`openapi.json` 0.14.0 leaves several things out, and the screen must not paper
over them. Each ruling below states what the wire actually gives us and what the
UI is therefore allowed to say. These are correctness rules, same as the truths
above.

| # | What the contract lacks | Ruling |
| --- | --- | --- |
| G1 | `Room` has no preview text. Its members are id, title, kind, type, memberCount, unread, lastMessageId, lastActivityAt, readable (and `typeCode` on macOS). | A room row shows a preview **only** from a message body this client already observed through `/context` or `/stream`. If none was observed the row reads 미리보기 없음. Fetching `/context` per row to fabricate previews is forbidden. **r3: this rule now applies to every row, `readable` or not.** |
| G12 | A board notice is kept by the client as its first **100 characters** only, and a long message as its first **3,999**; the rest of either is not on the machine. **Contract 0.18.0** (kanao-cli 0.24.0): `Notice.truncated`, and `fullText` / `fullTextMessageId` when exactly one live message begins with the whole preview — **found by its words, not an id** — with `fullTextTruncated` when that message is itself cut, and `fullTextCandidates` when several qualify. Windows-only until kamado-cli#45. | The notice sheet shows `fullText` when there is one, under a line saying it was found by its words and may be wrong; a cut message ends in … with a sentence that the rest is in KakaoTalk. With candidates, none is picked and the count is said; with neither, the preview ends in … and the sheet says only the start is stored. The notice bar keeps the preview. |
| G10 | **Contract 0.17.0** (kanao-cli 0.23.0) adds `Message.senderImage` — the sender's small profile picture — and `Room.images`, up to four pictures a room's icon is made of. **0.17.1** (kanao-cli 0.23.1): a room with a photo of its own — one a member set, or an open group chat's link picture — is that photo alone; otherwise the counterpart's for a 1:1, open 1:1 or channel, the account's own for the chat with oneself, otherwise up to four active members other than the account. Both appear only when there is one, are HTTPS on `*.kakaocdn.net`, and are **Windows-only** (`x-platform`) until kamado-cli#45. (`Message.photo` is still the content of a photo message, not a picture of its sender.) | **r4.2: a picture where the contract gives one, the monogram where it does not.** The monogram — the name's first grapheme on one of eight tones hashed from that name — is always drawn, and the picture is laid over it, so a slow, missing or refused picture never changes the square's size and a failure simply takes the picture away. An address that failed once is not asked for again in that tab. A room with one picture shows it; two to four are a grid inside the same squircle (two side by side; three with the first across the top; four as 2×2), and a picture that fails drops out of the grid. Every picture is `aria-hidden` with `alt=""` and `referrerPolicy="no-referrer"`, because the name it stands for is already in the row. No identity is implied beyond the name already shown, and like the name it is the picture that account carries now. |
| G2 | No mark-read route. `Room.unread` is the desktop client's count, and the only thing on the wire that moves it is `open=true`. | The badge is the **desktop's** count: accessible name 데스크톱 기준 안 읽음 N개. The client never sets it, decrements it or hides it; it changes only when a fresh `/rooms` says so. **r3: `/context` is sent with `open=true`**, so a room whose key is not in memory is opened in the desktop client and read there rather than answering `503 KEY_UNAVAILABLE` — opening a room in saya can therefore lower that room's desktop count on the next `/rooms`. Owner decision, 2026-09-23: a room the user chose to read is a room the user read. |
| G3 | `/context` takes `roomId` and a newest-N `limit` (1..1000, default 40). There is no offset, no before-id, no older-than cursor. | There is **no older-history pagination**. 더 불러오기 widens the newest window 40 → 200 → 1000 and then stops, showing the ceiling. Anything older than the 1000 newest is shown as out of reach, not silently absent, and the coverage line still states `hasEarlier`. |
| G4 | `/send` returns `submitted`, `dryRun`, `room`, `roomId`, `length` and the draft flags. No message id, no nonce, no delivery receipt. | A later `fromMe` row with equal text and a newer id is **observed evidence**, never causal proof: a duplicate line, a send typed on the desktop, or normalisation all break the match. The row appears above the ledge at once because it was read; the pending item stays below until the user presses 이 기록으로 확인. The request's own status never becomes "delivered". |
| G5 | `429 RATE_LIMITED` reports a full send queue (4). There is no queue-depth or drain signal. | The attempt is rejected and stays below the ledge. The UI never says or implies the queue emptied. Recovery is a fresh, explicit user attempt that passes `dryRun` and consent again. No timer re-enables the door. |
| G6 | `dryRun` and the real send are separate requests. | The draft may change between them. The confirmation is always phrased conservatively; the UI never claims the dry run locked anything. |
| G7 | `Mention.offset` units are unstated. | Mentions are shown from metadata (weight + underline on the name) and the full text is preserved. No character range is highlighted on a guess. |
| G8 | `Message.kind` is an open string. A photo arrives as `kind: "photo"` with the body text 사진 and, from kanao/kamado 0.19.0, `photo`: the first picture's `url`, `width`, `height`, the `count`, and `images` — every picture of an album in order, each `{url, width, height}`. The addresses are on the client's CDN (`talk.kakaocdn.net`, `dn-talk.kakaocdn.net`); the cores fetch nothing for them. Video and files still carry no URL. | **r3: a photo is drawn.** `images` is the single source of truth: one picture at its stored shape, an album as a grid of up to four tiles with the remainder as `+N`, and a press opens a modal at that picture with arrow keys between them. The box is reserved from the stored size so a loading photo never moves the line being read; a size the client did not store (`0`) becomes a square rather than a division by zero. The addresses are signed and short-lived, so an expired one says so instead of leaving a broken image, and `img-src` in the deployment CSP is widened to `https:` for exactly this. Video, file and feed still show a kind label and nothing else is invented. **When the label and the body are the same word only one is drawn** — and with a picture present, neither: the picture says it. |
| G11 | The contract says nothing about an address inside a message body. | Addresses become links, shown exactly as written. A preview card is drawn only from `/unfurl`, a facility of the proxy that is **not** the cores' contract: absent, slow or wrong, the link stands alone. The browser never contacts the linked site — its image is relayed — and the card's text is text, never markup. |
| G9 | Time and reply fields are nullable. | 시간 미상 and 인용 정보 없음 are shown explicitly. Never `Invalid Date`, never a crash. |

## Selected concept: what to keep, what to correct

| Area | Visible in concept | Contract rule | Departure? |
| --- | --- | --- | --- |
| Ledge law | Ledge spans the conversation pane; 보냈습니다 above, 입력됨 below | Keep exactly | — |
| Accent | Yellow only on the send door | Keep. One accent, one job | — |
| Unreadable 공지 | Full ink, 읽을 수 없음 (키 없음), no badge | Keep | — |
| Coverage line | First row of the thread, hairline beneath | Keep | — |
| Room list | Own cream field, full height to the bottom edge | Keep | — |
| Bubbles | Flat, tail-less, unoutlined, left-aligned both parties | **r3: own messages right-aligned, 14px radius, speaker and stamp inside the bubble, monogram circle beside it** | **Yes — r3 layout** |
| Unread badge | Red badge, white numeral | Keep the form; **change the red** | **Yes — contrast** |
| Ledge colour | Warm-white #FAF6EE seam | **1px slate #4E5D69** | **Yes — contrast** |
| List divider | Warm-white seam | **1px slate #4E5D69** | **Yes — contrast** |
| Send door | Square-cornered upright rectangle | **r3: a circle beside the pill composer.** Still the only saturated surface and the only shadow | **Yes — r3 layout** |
| Doorway gap | Not legible in the render | **r3: removed with the per-row divider slices; the active row is a filled, rounded field** | **Yes — r3 layout** |
| List divider | Per-row slices, broken by the active row | **r3: one divider on the list pane's trailing edge; the scrollbar gutter sits inside the list** | **Yes — r3 layout** |
| Column measure | Ran wider than intended | Cap at `62ch` | Corrected |
| Generated Hangul | Typos (화면어, 다서, 어변 주, 업에) | **Never product copy.** Use the strings in this file | Artifact |
| Black mass | Alpha hole, diagnosed | Not a design element. Ignore | Artifact |

## r4: the messenger arrangement

Reference: `bangome/xpmessenger` `renderer/index.html` and `renderer/styles.css`
(messenger tab only), read 2026-09-30. Its principles are taken as stated
there — borderless surfaces, hierarchy by weight, filled fields, rounded-square
thumbnails — with its colours replaced by saya's.

Provenance: the reference is a **private** repository with no licence file,
read through the owner's invitation as a collaborator. Only layout and form
values (sizes, radii, weights, spacing) are taken; no code, markup, stylesheet,
asset, icon or copy is copied into saya, and none of its product (the
groupware integration it clones) is referenced. Like `design/references/`, it
is provenance only and is never redistributed.

| Surface | r4 form | Colour (saya) |
| --- | --- | --- |
| Rail | `--rail-width` 84px column left of the list (72px at 768–1023px): the さ mark on a 44px ink squircle, then 대화 as an icon over an 11/700 label in a 62px rounded field; the current section is filled `--active-list`. The desktop's total unread count rides it (accessible name 데스크톱 기준 안 읽음 N개). **No connection dot**: no slice reports a connection state yet, so none is drawn. Hidden below 768px, where the list shows the mark beside its heading. | `--field-list`, `--seam` divider |
| List head | 대화 at 22/800 (the index view's h1; the product name follows in its accessible name), a 36px filled search field (radius 12), then filter pills 전체 · 안읽음 · 사람 · 그룹 (radius 999, 13/700; selected = ink field). Search matches **titles already loaded** only — there is no search route — and an empty result says so. 안읽음 is the desktop's count; 사람 is `kind: "direct"`; 그룹 is `kind` `group` or `open`. A kind the contract does not name (a live kanao 0.22.1 also sends `open-group`, `open-direct` and `channel`) appears under 전체 only. | `--fill-list`, selected `--ink` |
| Room row | 48px monogram squircle, title 15/700, time 12/500, preview 13.5px, badge on the preview line; padding 11px 10px, radius 14, hover and active are filled fields. | `--hover-list`, `--active-list` |
| Monogram | radius one third of its side at every size (squircle), 700 weight. r4.2: under a profile picture when the contract gives one (G10); a room's two to four pictures are a grid with 1.5px `--seam` gaps inside the same squircle. | the eight tones |
| Thread header | 40px monogram, title 17/800, subtitle 12.5/500; icon buttons 38px (radius 12, transparent until hovered): 발췌 and 모아보기. The words stay in the accessible names and tooltips. | `--fill-wall` on hover |
| Room side panel | 모아보기 is a 300px panel beside the conversation, under the header (not a modal). Kind pills, the scope sentence, a square-tile grid (radius 10), file and link rows without rules. Escape or × closes it and returns focus to its toggle. It stays open across rooms. Below 1024px it covers the conversation area. | `--field-list` |
| Turns | Turns span the wall; each bubble keeps the `62ch` measure. The speaker's name (12.5/700) sits **above** the bubble and the stamp (11/500, with 수정됨) **outside** it at its foot — left of my bubbles, right of others'. A run by one speaker on one day shows the 34px monogram and the name once; the rest keep the space. A new day opens with a centred pill (`dateStyle: full`), drawn only when the wire dated the turn. | `--bubble-other`, `--bubble-self`, `--fill-wall` pill |
| Bubble | radius 18 with a 4px tail corner: bottom-left for others, bottom-right for mine; padding 11px 15px. | unchanged |
| Composer | one filled box (radius 18) on `--field-input`: the field on top (15/1.6/500), a tool row under it with the Enter hint and the door at its end. The door is a 40px circle (44px below 768px), still the only saturated surface and the only shadow. | `--field-input`, `--accent-send` |
| Quiet controls | filled pills without a rule (radius 999, 13/700) in every sheet, notice and confirmation; pressed = ink field. | `--fill-wall` |
| Notice bar | 공지 as a small filled pill before the line. | `--fill-wall` |

Deliberately **not** taken from the reference, because the contract exposes
none of it: presence dots, read counts, attachments and pasted images in the
composer, emoji, message selection and deletion, multi-view, pinned rooms, and
the org chart, notifications, calendar and Jira sections. In-room search is
also not drawn yet: `/context` holds at most the newest 1000 turns and the wall
virtualises beyond 200, so a search would have to state its reach and scroll a
virtual list — left for a later revision rather than approximated.

## r5: 연결, the messenger adapters (`feat/multi-provider`)

The tsuba adapters are separate upstreams with their own contract
(`contracts/tsuba.openapi.json`, 0.2.1). r5 draws what that contract has:
capabilities, rooms with their own narrowed features, messages with their
attachments, the stream and sending. An adapter outside the contract's caret
range is never drawn, only named.

| Surface | r5 form |
| --- | --- |
| Rail | r5.1: the sections are **전체** (two bubbles), **카카오** (K in an outlined squircle, with the desktop's unread total), one item per adapter (its declared name, its initial in the same squircle, and once it has listed its rooms the sum of their unread counts as the messenger reports them, in the same badge as 카카오's; a room view's read mark lowers it at once) and **연결** (a link icon). Same 62px fields, filled `--active-list` when current. Still no status dot. |
| List tabs (below 768px) | The rail's sections as a row of 44px pills at the top of the list column, above whichever list is shown and outside its navigation (전체 · 카카오 · each adapter · 연결; current = ink field), scrolling sideways when they do not fit. The KakaoTalk list keeps its own head and filter pills below them. |
| 전체 (`#/all`) | One list over every messenger, newest activity first: KakaoTalk rooms from the catalog this tab holds and each adapter's rooms as declared, in rows like the KakaoTalk list's. The avatar carries the messenger's letter on a 20px ink disc (K for KakaoTalk; named for screen readers). A messenger that cannot answer says so in one line above the rows and the rest stay; KakaoTalk being down is that one line here, and the whole-screen notice only under 카카오. Search matches loaded titles. A live adapter message moves its room up at once; the list is asked again shortly after so unread counts stay the messenger's. |
| Adapter list (`#/list/<id>`) | The same list for one adapter. An adapter outside the contract range is the one line (its contract version beside the one saya follows) and no rows. |
| KakaoTalk notice | Every whole-screen notice ends with the link 다른 메신저 연결 보기: a core being down does not close the adapters. |
| 연결 view (`#/adapters`) | The room header's form (title 연결, subtitle 메신저 연결, back chevron below 768px), then the **카카오톡 card first, always** — it needs no adapter setting — and one card per adapter, in the `62ch` column, spanning the list and thread columns from 768px. Reachable whatever the KakaoTalk core is doing. No rooms are listed here: rooms are in the list tabs. |
| 카카오톡 card | The same card: K on the ink squircle, 카카오톡, the state as a word (확인 중 · 연결됨 · 인증 필요 · 준비 안 됨 · 거절됨 · 닿지 않음 · 응답 이상 · 목록 초과) from the app's own catalog request, the source line (데스크톱 카카오톡 · kanao / kamado serve), the room count, and the features the KakaoTalk contract gives as pills. Otherwise one sentence on what to check and 다시 확인, which asks for the catalog again. |
| Adapter card | `--field-list` fill, radius 14, no rule. The provider's initial on a 36px ink squircle (no messenger artwork), name 17/800, and the state as a **word** on a pill: 확인 중 · 연결됨 · 인증 필요 · 거절됨 · 닿지 않음 · 응답 이상 · 버전 다름 (연결됨 on `--active-list`, never colour alone). Connected: the account kind as a sentence (a bot says it sees only the rooms it was added to), adapter and contract versions, then the declared features as pills in the contract's vocabulary. Nothing declared: one sentence saying so. Otherwise one sentence on what to check and 다시 확인. |

| Adapter room (`#/adapters/<id>/<roomId>`) | Opened from a list, it sits in the thread column beside that list, as a KakaoTalk room does, and its back chevron returns to that list below 768px; opened from 연결, it takes the wide view. The room header (back chevron at every width when alone; 40px monogram; title; the provider's name as subtitle). The wall: turns oldest first, others left with the name once per run, mine right; bubble radius 18 with a 4px tail corner, the stamp outside at the foot with 수정됨 when edited; service turns are a centred pill. A reply carries a quote at the bubble's top (a 2px rule, the answered sender, one line of what it said; 불러온 범위 밖의 메시지에 대한 답장 when that message is not loaded). With `reactions.read`, reactions sit under the bubble as 28px pills (emoji and count, mine on `--active-list`), and they are buttons that toggle mine when `reactions.send` is declared. With `attachments.read`, a raster picture fills the bubble's top at up to 300px (radius 12, its width and height reserving the space) and opens full size in a new tab; a sticker alone is 160px and stands on the wall without a bubble; every other file is a filled row (radius 12, at least 44px) with its name, then kind · length · size, and downloads. A picture that fails becomes that row saying 불러오지 못했습니다. Without `attachments.read`, media turns say 사진·파일 등 above their caption. 이전 메시지 더 보기 at the top when `paging: before-id` and earlier messages exist; the scroll position holds when they arrive. |
| Message tools | A 28px ⋯ door after the stamp (44px on touch screens), quiet until the turn is pointed at or focused. It opens a row under the turn: the six quick reactions (👍 ❤ 🔥 😁 😢 🙏, mine filled) with `reactions.send`, 답장 with `messages.reply` where the room allows sending, 수정 on my own text inside `maxAgeSeconds`, 삭제 on my own messages. 삭제 asks first (모두에게서 삭제할까요? when `forEveryone`) with an ink 삭제 pill and 취소. Escape closes the row. Each write is one attempt: a refusal says why under the turn, anything else says the outcome is unknown, and nothing is retried. A tap past `maxPerMessage` replaces my oldest reaction. A room that removes sending keeps only the reactions. |
| Adapter composer | One filled box (radius 18) with the field and a 보내기 pill. Enter sends (not while composing Hangul; Shift+Enter is a new line). Over `maxLength` code points it says so and does not send. A refused send says why and keeps the text; an unanswered one says it is unknown whether it went and is never retried. A stored message appears once, whether the answer or the stream brings it first. Without `messages.send`, one sentence instead of the box; when the adapter declares it but the room removes it (`Room.features`), the sentence is 이 방에는 이 계정으로 보낼 수 없습니다. Replying or editing puts one line above the box: ○○에게 답장 with the answered message's first line, or 메시지 수정, then 취소 (Escape too). An edit works on a copy of the message's text, so the unsent draft comes back afterwards; the pill reads 수정, and an unchanged text cannot be sent. |

The card reads the provider's name from the declaration and never branches on
it: a second messenger is a second card, not new code. Live arrivals come from
one `/stream` per open adapter room, resumed by cursor after a drop with a
backoff, and the drop is said in one line above the composer while it lasts.
With `read.mark`, the newest message from someone else is marked read once the
wall is at its foot and the page is in front, as the messenger's own client
does, and the lists drop that room's count at once; a room the list already
showed as read is not marked again until something new arrives. Edits,
deletions and reactions made elsewhere arrive on the same stream
(`message.edited`, `message.deleted`, `reactions.updated`) when the adapter
lists them.

## Embedded tokens

r4 adds form tokens only: `--radius-row 14px`, `--radius-field 12px`,
`--radius-talk 18px`, `--radius-tail 4px`, `--radius-box 18px`,
`--radius-tile 10px`, `--rail-width 84px`, `--panel-width 300px`,
`--text-heading 22px`, `--text-room 17px`; `--fill-wall` (wall 90% / ink),
`--hover-wall` (94%) and `--field-input` (`#FFFFFF`, dark `#493630`).
`--list-width` becomes `clamp(280px, 26%, 340px)`.

**r4.1, owner's call 2026-09-30:** the list and other people's bubbles are
white, and the list's former cream `#EFE7D9` becomes its hover. The list's
states are one cream family deepening with the state — `--fill-list`
(`#EFE7D9` 60% / white = `#F5F1E8`: search, pills, tiles, link cards) <
`--hover-list` `#EFE7D9` < `--active-list` `#E3D7C0` (the current row and
section). The dark theme keeps its warm list, so there these three stay mixes
of it with ink (91% · 95% · 84%). Measured on the white list: `--ink` 14.85 on
white · 13.17 on fill · 12.09 on hover · 10.43 on active; `--ink-muted` 6.79 ·
6.02 · 5.53 · 4.77 — all at or above the r2 floors.

Contrast ratios below are **measured**, not estimated (WCAG 2.1 relative
luminance, computed 2026-09-21; the two r4.1 rows 2026-09-30).

| Token | Value | Use | Measured contrast |
| --- | --- | --- | --- |
| `--field-wall` | `#CBDDE9` | conversation above the ledge | — |
| `--field-list` | `#FFFFFF` (r4.1; was `#EFE7D9`) | room list, rail and side panel, full height | — |
| `--field-ground` | `#E3D7C0` | conversation below the ledge | — |
| `--ink` | `#2A2724` | body text, room titles | 10.65 on wall · 14.85 on list · 10.43 on ground · 14.85 on bubble |
| `--ink-muted` | `#4E5D69` | speaker, time, preview, coverage, state words | 4.87 on wall · 6.79 on list · 4.77 on ground — **AA, not AAA** |
| `--rule` | `#4E5D69` @1px | **the ledge and the list divider** | 4.87 / 4.77 / 6.79 — clears the 3:1 non-text floor |
| `--bubble-other` | `#FFFFFF` (r4.1; was `#FAF6EE`) | other people's bubbles | ink on it: 14.85 |
| `--bubble-self` | `#F4EBDA` | the signed-in user's bubbles | ink on it: 12.55 |
| `--accent-send` | `#F3B41B` | **the send door and nothing else** | ink on it: 8.03 |
| `--accent-send-inset` | `#C98E0E` @1px | the door's inset line | — |
| `--badge-unread` | `#BB3322` | unread badge fill only | **white on it: 5.82 (AA pass)** |
| `--badge-unread-ink` | `#FFFFFF` | the unread numeral | — |
| Spacing scale | `4 8 12 16 24 32 48 64` px | — | — |
| Radius | `bubble 14px` · `badge 999px` · **`door 50%`** · `room row 10px` · `composer 22px` | r3: the door is a circle | — |
| Avatar | monogram on one of eight tones, hashed from the name, beneath contract-provided pictures | KakaoTalk uses `Room.images` / `Message.senderImage`; adapters may use optional `Room.avatar` / `Message.senderAvatar` through their same-origin media route | — |
| Border width | `1px` everywhere | no 2px rules | — |
| Elevation | exactly one: `0 2px 6px rgba(42,39,36,.18)` on the send door only | — | — |
| Motion | `--dur-cross 300ms` · `--dur-fade 160ms` · `--ease cubic-bezier(.2,.0,.2,1)` | — | — |

**Two deliberate departures, both forced by measurement.**

1. The concept's warm-white seam measures **1.29:1** against the wall, and the
   wall and ground measure **1.02:1** against each other — they differ in hue but
   not in luminance. The ledge is the load-bearing signal of the whole design, so
   it cannot be invisible to reduced colour vision. The ledge and the list divider
   become 1px `--rule` slate. Field tones remain as a secondary, redundant cue.
2. The concept's badge red `#D8452F` gives white numerals **4.36:1**, below the
   4.5 AA floor. `#BB3322` gives **5.82** and stays in the reference's brick-red
   family.

## Geometry and layout

Optional spatial citations use StyleGallery at pinned revision
`a41577742eab023c2156afc6e3e84b1476eb3e0b` (checked 2026-09-14). A citation names
a responsibility only; every value here is local and explicit.

| Surface | Structure | Sizing | **Scroll owner** | Citation |
| --- | --- | --- | --- | --- |
| App shell ≥1024px | two columns, list + conversation | list `clamp(240px, 25%, 320px)`; conversation fills the rest | neither — the shell never scrolls | `stylegallery:fixed-sidenav-shell@a415777` |
| Room list | vertical stack, full height top to bottom edge | rows auto-height, 12px vertical rhythm | **the list column, independently** | `stylegallery:stack@a415777` |
| Room row | title+time on line 1, observed preview or 미리보기 없음 + badge on line 2 | badge `min-width 20px`, `height 20px` | — | `stylegallery:cluster@a415777` |
| Conversation wall | message stack above the ledge | measure **max `62ch`**, left-aligned | **the wall region only** | `stylegallery:scroll-body-shell@a415777` |
| Ledge | 1px `--rule`, spans the conversation pane only; never crosses the list | — | — | — |
| Ground | pending stack + draft note + composer | same `62ch` measure | **pinned. Only its pending sub-stack scrolls**, inside the `40dvh` cap | `stylegallery:sticky-footer@a415777` |
| Message turn | speaker/time line above a bubble | bubble hugs content, `max-width 100%` of measure | — | `stylegallery:stack@a415777` |

- **Reading order:** room list → room title → coverage → messages oldest-first →
  ledge → pending → draft warning → composer → send.
- **The doorway gap.** The vertical divider is interrupted for the full height of
  the active room's row, a gap of at least `24px`. This is the only ornamental
  gesture in the product and it costs no colour. It must be implemented as an
  actual break in the rule, not a lighter segment.
- **Scroll ownership, stated once.** Exactly two regions scroll: the room list
  and the conversation wall. The shell is `100dvh` and `body` never scrolls. The
  ground is pinned; the composer, the draft note and the door never move. When
  pending items outgrow the ground's `40dvh` cap, only the pending sub-stack
  scrolls, inside the ground.
- **The ledge is a boundary, not a coordinate.** It sits wherever the ground's
  content puts it, growing upward as pending items accumulate up to the `40dvh`
  cap, and the wall keeps a minimum of `30dvh`.
- Constraints are container-local, driven by container width, not viewport media
  queries, except where the mobile rules below state otherwise.

## Frame and ornament system

The direction is **near-unornamented**, and this is a prohibition, not an omission.

| Element | May appear | Forbidden | Role |
| --- | --- | --- | --- |
| Send door | once, at the right end of the composer | anywhere else; any rounding; any second yellow | the only saturated action surface |
| Door inset line | inside the door | elsewhere | 1px `--accent-send-inset` |
| Doorway gap | the active room row only | any other row | the one flourish |
| Cat mark | empty states, the connecting state, the brand mark, and standing at the ledge/divider junction on ≥1024px | as an avatar, a sticker, a reaction, or anywhere in the message flow | quiet signature |
| The one shadow | the send door | every other element | depth for the action only |

Decorative additions beyond this table are prohibited. No gradients, no
glassmorphism, no neumorphism, no stacked shadows, no diagonal layout geometry,
no grain or noise over any text surface, no weathering or distress textures, no
lettering or wordmark copied from any reference.

## Typography

**Font availability is NOT verified.** The direction names Pretendard; its files,
licence, weights and Hangul coverage were not checked in this run. Treat the
preferred family as pending.

**r4.3, the face is the messenger arrangement's, as it ships it** (owner's
call, 2026-09-30: "폰트 xpmessenger 꺼 그대로"). Pretendard Variable 1.3.9 dynamic
subsets — the same files the reference loads — vendored under `/fonts/` with
**`font-display: swap`**, as upstream ships them; the earlier `optional` meant a
first visit never showed Pretendard at all and read in Malgun Gothic. Tracking
`-0.02em` on the page and `-0.025em` on message and composer text, message text
at weight 500, antialiased; the stack is the reference's. The fallback check
above still applies: a subset that arrives late swaps once.

**r4.3, owner's call 2026-09-30: every size is one step smaller** — "전체적으로
폰트가 너무 큰게 많다". Message body 14/1.6, room title 14, secondary text 12,
unread numeral 11, door label 14; the list heading 19/800, the thread title
15/800, the room row's preview 12.5 and time 11, the speaker 11.5, the header
subtitle 11.5, filter pills 12. The r4 table above and the rows below keep
their older numbers as history; these win.

| Role | Preferred | Fallback stack | Size / line-height / weight |
| --- | --- | --- | --- |
| Message body | Pretendard *(pending verification)* | `Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` | 15px / 1.6 / 400 |
| Room title | same | same | 15px / 1.4 / 500; active row 600 |
| Preview, speaker, time, coverage, state words | same | same | 13px / 1.45 / 400, `--ink-muted` |
| Unread numeral | same | same | 12px / 1 / 600, tabular figures |
| Door label 보내기 | same | same | 15px / 1 / 600, `--ink` |

- Line length is capped at `62ch`; long Hangul must never span the full pane.
- Times use tabular figures so the right edge of each row does not jitter.
- **Fallback check required:** Malgun Gothic's metrics differ from Pretendard's;
  verify that room rows do not reflow to three lines and that bubbles do not
  change height when the webfont fails. Test with the webfont blocked.
- No italic. Hangul has no true italic and synthesised oblique is a defect.

## Components and interaction states

| Component | Anatomy | Limits | Semantics |
| --- | --- | --- | --- |
| Room row | title, time, observed preview or 미리보기 없음, unread badge, unreadable note | preview one line, ellipsis; observed bodies only (G1) | `<a>` within a `<nav>` list; `aria-current="page"` when active |
| Unread badge | `--badge-unread` pill, white numeral | **exact count 1..99, then `99+`**; 0 shows no badge | the full number goes in the row's accessible name, e.g. 데스크톱 기준 안 읽음 143개, even when the pill reads 99+; never cleared by the web (G2) |
| Message turn | speaker+time line, optional quote block, bubble | — | `<article>` in a `<section role="log">` |
| Quote block | 2px left rule `--ink-muted`, quoted text | 2 lines then ellipsis | `<blockquote>` |
| Mention | 600 weight + 1px underline | — | **never colour alone** |
| Coverage line | muted text + 1px rule under | — | first child of the log |
| Composer | hairline underline input + send door | — | `<form>`; Enter sends, Shift+Enter newline |
| Send door | square yellow rect, inset line, label | — | `<button type="submit">` |

### States

| Flow | State | Treatment | Recovery |
| --- | --- | --- | --- |
| Send | idle | door at full `--accent-send` | — |
| Send | confirming (`dryRun`) | **r4.3, owner's call 2026-09-30 ("미리보기 없이 그냥 보내게"): the dry run runs silently and the panel appears only when `wouldClearDraft`** — the resolved room and the sentence 보내면 데스크톱 앱에 쓰고 있던 초안이 지워질 수 있습니다. Any other send goes on Enter with no panel; truth 4 still holds, because the one case it protects is the one still asked about. | cancel restores focus to the input |
| Send | submitted, unproven | bubble appears **below the ledge**, `--bubble-self`, state word 입력됨 · 전달 미확인 | none offered; **never auto-retry** |
| Send | candidate observed | a new `fromMe` row is already above the ledge because it was read back; the pending item offers 이 기록으로 확인 | the user links them; nothing auto-matches (G4) |
| Send | linked by the user | the pending bubble crosses the ledge once, 300ms, into the observed row; state word 보냈습니다 belongs to the read row | — |
| Send | `SEND_FAILED`, timeout, abort | stays below the ledge, state word 결과 확인 필요, with a manual 다시 보내기 the user must press | explicit user action only, through a new `dryRun` and consent |
| Send | `429 RATE_LIMITED` | attempt rejected, stays below the ledge, 보내는 중인 메시지가 많습니다 | a fresh explicit attempt by the user; no timer, no "queue is empty now" claim (G5) |
| Send | result lost (tab closed, leader gone) | 결과 확인 필요 | never re-sent on the user's behalf |
| Room | `readable: false` | full ink; preview replaced by 읽을 수 없음 (키 없음); no badge; **no dimming** | an explainer on how to open the room in the desktop client |
| Room | no observed body yet | preview line reads 미리보기 없음 | fills in once a body arrives through `/context` or `/stream` |
| Thread | window ceiling | after 1000 newest, a muted line: 여기서 볼 수 있는 가장 오래된 메시지입니다. 더 이전 기록은 데스크톱 앱에서 확인하세요 | none: no older-history route exists (G3) |
| Room | ambiguous | a chooser listing every candidate with `memberCount` and `lastActivityAt` | user picks; never auto-resolve |
| Stream | connecting | the cat walks in the list's footer | — |
| Stream | gap after resume | a muted line in the thread: 연결이 끊긴 동안의 일부 대화는 아래에 없을 수 있습니다, with a 지금 불러오기 action calling `/context` | — |
| Stream | `503 BUSY` | 이 컴퓨터에서 열 수 있는 실시간 연결을 모두 사용 중입니다 (8개) | retry control |
| Auth | `401` | the token screen — **distinct from 503** | re-enter the token |
| Host | `503` + `KAKAO_NOT_RUNNING` etc. | a host-state screen naming the specific code | retry |
| Host | `PERMISSION_REQUIRED` | its own macOS instructions screen | reopen after granting |
| Thread | empty | the cat, plus 이 기기에 저장된 대화가 없습니다 — **never** "대화가 없습니다" | — |

All interactive elements need `:focus-visible` as a 2px `--ink` outline offset
2px. Hover changes background tone only, never layout.

## Responsive rules

r4: from 768px the shell is rail + list + conversation; the side panel sits
beside the conversation from 1024px and covers it below. Below 768px there is
no rail, and the rest of this table holds.

| Range | Layout |
| --- | --- |
| ≥1024px | two panes. List `clamp(240px,25%,320px)` full height to the bottom edge, its own scroll. Ledge spans the conversation pane. Cat at the ledge/divider junction. |
| 768–1023px | list narrows to 220px, previews hidden, title + time + badge only. Cat hidden. |
| <768px | single pane. The list is a separate view; the thread gets a header row with a back chevron and the room title. Ledge spans the full width. Ground pinned to the bottom. No cat. |

- Touch targets ≥44×44px below 768px; the send door grows to 44px tall while
  keeping square corners.
- The ledge never disappears at any width. If it will not fit, reduce the wall,
  never the ground: **losing the boundary loses the product's central claim.**
- Verify at 320px width and at 200% browser zoom; text must reflow without
  horizontal scrolling.

## Motion and reduced motion

### Theme character feedback (2026-10-03)

- A theme loader reserves its own line: 10em square (five times the former
  2em), capped at 70vw, 35dvh and the available container width. The list
  footer uses 180px instead of 36px, with the same containment. No negative
  margins; text stays below the character.
- The existing 28px header badge becomes a labelled button in both lists.
  Its hit area is 44px, with the existing hover fill and focus ring.
- Activation plays one 2.4s dance, then restores the badge. A theme with
  a self-animated loader reuses that asset; other themes sway, hop and tilt
  the badge using transforms. Repeat presses during the dance do not queue.
- Reduced motion keeps the static badge, never swaps to an animated asset
  and suppresses the positional dance. Built-in themes hide the button.

| Trigger | Property | Duration / easing | Reduced-motion |
| --- | --- | --- | --- |
| User links a pending item to an observed row; crossing the ledge | transform + opacity on one overlay clone | 300ms `--ease` | no movement: the pending item disappears and the observed row is announced |
| New message arrives | opacity 0→1 | 160ms | instant |
| **Cat, while connecting** | 4–6 frame walk cycle, translateX, looping | ~1.2s per loop | **the cat stops and sits; a static mark remains visible** |
| Room switch | opacity | 160ms | instant |

The crossing is the only movement with meaning; everything else fades. Under
`prefers-reduced-motion: reduce` every state change must remain **observable
without motion** — the state word and the side of the ledge always carry the
information, so nothing is lost.

## Accessibility

- Target: **WCAG 2.1 AA**. Measured text pairs are recorded in the token table;
  `--ink-muted` clears AA but not AAA, which is accepted for metadata.
- Landmarks: `<nav>` for the list, `<main>` for the thread, `<form>` for the
  composer. One `<h1>` per view, the room title.
- The thread is `role="log"` with `aria-live="polite"`; arriving messages are
  announced. Linking a pending item to an observed row announces 보냈습니다.
- **Never colour alone.** Unread = badge *and* accessible text. Mention = weight
  *and* underline. Send state = the word *and* the side of the ledge.
- Keyboard: Tab reaches list → thread → composer → door. Enter sends,
  Shift+Enter newlines, Escape cancels the confirmation and restores focus.
- Focus is managed on room switch: move it to the room title, not the top.
- The unread badge must not be the only accessible signal. The full count goes
  in the row's accessible name, including above 99 where the pill shows 99+.
- Non-text contrast: the ledge, the divider and focus rings all clear 3:1
  (measured 4.77–5.53).

## Asset manifest

| Asset | Path | Origin / rights | Status |
| --- | --- | --- | --- |
| Selected concept | `design/seeds/C4-flat-wall.png` | generated this session | **ready — evidence only, never a shipping asset** |
| Other candidates | `design/seeds/C{1,2,3,5,6}*.png` | generated | ready, evidence |
| Submitted prompts | `design/seeds/prompt-C*.txt` | this session | ready |
| Reference provenance | `design/references/REF-{A..E}.jpg` | owner-supplied, creator unknown, **no licence** | provenance only; never redistributed, never shipped |
| **Cat mark (SVG)** | not created | must be drawn as an original vector | **PENDING** — must not be cropped from a concept image |
| **Cat walk cycle** | not created | original | **PENDING** |
| Pretendard webfont | not obtained | licence unverified | **PENDING** |

A generated concept is never painted as a page background with clickable
overlays. Every control is a real interface element.

## Interoperability declarations

```txt
Consumer reference: not_applicable
Consumer reference reason: This design contract declares no StyleGallery-local reference record.
```

- Cited identifiers: `fixed-sidenav-shell`, `stack`, `cluster`,
  `scroll-body-shell`, `sticky-footer`, all at `@a415777`.
- Pinned revision re-read this session: yes, from the skill's pinned index. No
  upstream LICENSE exists at that revision, so identifiers are cited and no
  upstream prose, CSS or token value is copied.

## Implementation order

1. Generate types from `openapi.json`. Do not hand-write them. Add a CI check
   that the local copy still matches the cores byte-for-byte.
2. Tokens, the fallback font stack, and `GET /health` — the one unauthenticated
   route, so connection can be proven separately from authorization.
3. Token handling plus `GET /rooms`; make `401` and `503` visibly different
   screens. Build the room list including the unreadable row.
4. `GET /context`: the thread, the ledge, quotations, mentions, coverage.
5. One shared `/stream`, cursor resume, backoff, and the gap disclosure.
6. `POST /send` last: `dryRun` confirmation, the draft warning, the pending zone,
   and read-back before any message is called 보냈습니다.
7. Responsive rules, the cat's motion and its reduced-motion alternative.
8. Real-browser QA at 1440×900, 768px and 390×844.

## Acceptance checks

| Surface / state | Observable pass condition | Method |
| --- | --- | --- |
| Ledge, desktop + mobile | A pending message renders below the ledge; it leaves only when the user links it to an observed `fromMe` row | stub `/send` + `/context` |
| Send wording | 보냈습니다 appears only on a `fromMe` row that was actually read back; never on a request | unit + real-surface |
| No causal match | An identical `fromMe` row typed on the desktop does not auto-resolve the pending item | stub `/context` with a duplicate body |
| Preview | A room with no observed body shows 미리보기 없음 and triggers no `/context` request | network stub, zero calls asserted |
| Unread | Opening a room changes neither the badge nor the accessible count; 143 unread reads 99+ with 143 in the name | stub `/rooms` |
| History ceiling | After the 1000 window the ceiling line appears and no further `/context` is sent | stub |
| 429 | The door is not re-enabled by time; only a new user attempt sends | fake clock |
| Uncertain send | `SEND_FAILED` produces no automatic retry; exactly one manual control | stubbed failure |
| Draft warning | `wouldClearDraft` is shown *before* the send, never after | `dryRun` stub |
| Unknown error code | An invented code renders the default branch, not a crash or a blank | stub a code absent from the enum |
| Ids | A room id above 2^53 round-trips through selection and URL unchanged | unit, with `18491246151592761` |
| Unreadable room | 공지 is present, full ink, undimmed, reason stated, no badge | visual |
| Empty thread | Copy never says the conversation does not exist | visual |
| Ambiguity | `409` with candidates renders a chooser; nothing auto-selects | stub |
| Stream cap | A 9th connection attempt is impossible from one client; `503 BUSY` has its own screen | integration |
| Contrast | Every pair in the token table measures at or above its recorded value | automated |
| Reduced motion | With `prefers-reduced-motion`, the cat stops and the crossing is instant, with no state lost | visual |
| Keyboard | List → thread → composer → door, with a visible focus ring throughout | manual |
| Zoom | 200% zoom at 1280px reflows without horizontal scroll | manual |
| Font fallback | With the webfont blocked, no row reflows to three lines | manual |
| No real data | No fixture, screenshot or committed artifact contains a real name, title or message | review |

Stubs must be able to return `401`, `429`, `503 BUSY` and a malformed envelope. A
stub that cannot fail is a test passing against an error path that cannot happen.

## Assumptions, blockers and approval

| Open item | Impact | Owner | Fallback |
| --- | --- | --- | --- |
| Stack | settled in `.omo/plans/client-performance-implementation.md`: React + TypeScript + Vite static SPA | lead | — |
| Token placement: proxy vs browser | blocks step 3 | owner | proxy-injected header; browser never holds it |
| Pretendard licence / coverage | blocks final type | implementer | the system fallback stack above |
| Cat SVG + walk cycle | blocks the connecting state | owner to supply or commission | a static mark |
| **No contacts route exists** | 친구목록 is `kind:"direct"` rooms only | owner | raise an issue on `kanao-cli` / `kamado-cli` |
| Warm dark palette | unspecified | — | **not designed.** Rust wall, darker terracotta ground, faint amber ledge was recorded as intent only and never rendered or measured |
| `openapi.json` CRLF | `shasum` in `BRIEF.md` §1 mismatches on Windows | maintainer | add `.gitattributes` marking it `-text` |

**Owner approved this contract revision on 2026-09-21**, explicitly accepting
both measured departures from the concept (the slate ledge, the darker badge
red) and the pending items in the table above.

This document declares the design ready for implementation. It does **not**
claim the product is built or tested. S5 implementation has not started and
begins only on a separate instruction.
