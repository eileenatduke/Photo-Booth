# Photo Booth

# Vercel Link: https://photo-booth-two-pink.vercel.app/

A desktop photo booth app. Pick a layout, snap a few shots with a countdown,
apply a filter, then download or scan a QR code to grab the result on your
phone. Sessions are ephemeral — nothing is saved or sent anywhere.

Built with Tauri 2, React, TypeScript, Tailwind, Zustand, and MediaPipe
(for background replacement). The QR delivery uses a tiny Rust HTTP server
bound to the LAN that shuts down at the end of the session.

## Prerequisites

- **Node.js** 18+ and **npm**
- **Rust** stable toolchain (`rustup`)
- Platform prerequisites for Tauri 2:
  https://tauri.app/start/prerequisites/
  - Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `librsvg2-dev`,
    `libsoup-3.0-dev`, `pkg-config`, `build-essential`

## Run in development

```bash
npm install
npm run tauri dev
```

The dev command launches the Tauri desktop window with hot-reload from the
Vite dev server. A webcam permission prompt appears the first time.

## Build a production binary

```bash
npm run tauri build
```

The bundle ends up under `src-tauri/target/release/bundle/`.

## How it works

- **Frontend state machine** (`src/state/session.ts`, Zustand): tracks which
  step the user is on, the chosen layout, retake count, and the in-memory
  shots / composed image / chosen filter.
- **Composition** (`src/lib/compose.ts`): a pure function that takes the
  captured shots plus a layout definition and produces a single PNG data
  URL via the Canvas 2D API.
- **Filters** (`src/filters/index.ts`): applied post-composition by
  manipulating `ImageData`. Vintage adds a vignette and grain on top.
- **Background replacement** (`src/lib/segmentation.ts`): MediaPipe
  `ImageSegmenter` (selfie segmenter) drives a per-frame compositor that
  runs in the render loop in `CameraView`.
- **QR delivery** (`src-tauri/src/qr_server.rs`): a `tiny_http` server
  binds to `0.0.0.0:<random-port>` and serves the PNG at a path with a
  random ID. The URL combines the host's LAN IP with that port and path,
  and is encoded into the QR. The server is torn down on "Start new
  session" or app close.

## Project structure

```
photo-booth/
├── src/
│   ├── App.tsx                     # state-machine router
│   ├── components/                 # one component per step
│   ├── layouts/index.ts            # 6 layout definitions
│   ├── filters/index.ts            # 5 canvas filters
│   ├── lib/
│   │   ├── camera.ts               # getUserMedia helpers
│   │   ├── segmentation.ts         # MediaPipe wrapper + compositor
│   │   ├── compose.ts              # final image composition
│   │   ├── backgrounds.ts          # preset backdrop generators
│   │   └── qr.ts                   # QR data-URL helper
│   └── state/session.ts            # Zustand store
├── src-tauri/
│   └── src/
│       ├── main.rs
│       ├── lib.rs                  # Tauri commands
│       └── qr_server.rs            # LAN HTTP server
└── public/
    ├── models/                     # MediaPipe model (bundled)
    └── mediapipe-wasm/             # MediaPipe WASM runtime (bundled)
```

## Privacy

- The composed image lives in memory and (briefly) in the QR server.
- The QR server binds to `0.0.0.0` so phones on the same Wi-Fi can reach
  it. It is taken down on "Start new session" or app close.
- The app makes no outbound network calls during a session — the
  MediaPipe model and WASM runtime are bundled.
