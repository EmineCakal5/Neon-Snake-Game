# 🐍 Neon Snake

Classic Snake game with a neon aesthetic, built using React + TypeScript frontend and a Node.js/Express backend proxying Google Cloud Vertex AI APIs.

## ✨ Features

- 🎮 Smooth gameplay with keyboard controls (Arrow Keys / WASD)
- 📱 Mobile support with swipe gestures
- 🔊 Sound effects with toggle option
- 🏆 High score tracking
- ⏸️ Pause / Resume functionality
- 💡 Neon glowing visuals with dark theme

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express |
| Cloud | Google Cloud Vertex AI |
| Styling | Tailwind CSS |

## 📁 Project Structure

```
neon-snake/
├── frontend/       # React + TypeScript game client
└── backend/        # Node.js/Express server (Vertex AI proxy)
```

## ⚙️ Prerequisites

- **Node.js & npm** — [Download here](https://nodejs.org)
- **Google Cloud SDK** — [Install guide](https://cloud.google.com/sdk/docs/install)

After installing the SDK, authenticate:

```bash
gcloud init
gcloud auth application-default login
```

## 🚀 Setup & Run

**1. Clone the repository**
```bash
git clone https://github.com/EmineCakal5/Neon-Snake-Game.git
cd neon-snake
```

**2. Create the backend environment file**

Create `backend/.env.local` with the following variables:
```env
API_BACKEND_HOST=127.0.0.1
API_BACKEND_PORT=5000
API_PAYLOAD_MAX_SIZE=7mb
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_PROJECT=your-project-id
PROXY_HEADER=your-proxy-header
```

**3. Install dependencies & start**
```bash
npm install && npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 🎮 How to Play

- **Start:** Click *Start Game* or press `Space`
- **Move:** Arrow Keys or `W A S D`
- **Pause:** Press `P` or tap the pause button (mobile)
- **Goal:** Eat the food to grow and increase your score — don't hit the walls or yourself!

## 📄 License

This project is intended for demonstration and prototyping purposes.
