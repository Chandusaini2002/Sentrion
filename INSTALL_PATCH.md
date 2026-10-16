# Install Sentrion NVR + MediaMTX patch

This patch contains complete replacement files. It does not contain `.env`, database files, passwords, `.venv`, or `node_modules`.

Assuming your current project is:

```text
/Users/cp/Documents/security/sentrion-footage/sentrion
```

## 1. Stop frontend/backend

Press `Ctrl+C` in both terminals.

## 2. Back up the current project

```bash
cd /Users/cp/Documents/security
cp -R sentrion-footage/sentrion sentrion-before-nvr-mediamtx
```

## 3. Extract this patch

```bash
rm -rf nvr-mediamtx-patch
mkdir nvr-mediamtx-patch
unzip ~/Downloads/sentrion-nvr-mediamtx-patch.zip -d nvr-mediamtx-patch
```

## 4. Copy patch files over the existing project

```bash
rsync -av \
  nvr-mediamtx-patch/sentrion-nvr-mediamtx-patch/ \
  sentrion-footage/sentrion/
```

Your existing `backend/.env` remains untouched because this patch contains only `.env.example`.

## 5. Add MediaMTX settings to backend/.env

```bash
cd /Users/cp/Documents/security/sentrion-footage/sentrion/backend
nano .env
```

Add:

```env
MEDIAMTX_API_URL=http://127.0.0.1:9997
MEDIAMTX_WEBRTC_URL=http://127.0.0.1:8889
MEDIAMTX_HLS_URL=http://127.0.0.1:8888
```

Do not change `SECRET_KEY` or `CAMERA_ENCRYPTION_KEY`.

## 6. Install local streaming tools

```bash
brew install ffmpeg mediamtx
```

## 7. Start MediaMTX (Terminal 1)

```bash
cd /Users/cp/Documents/security/sentrion-footage/sentrion
mediamtx mediamtx/mediamtx.yml
```

## 8. Start FastAPI (Terminal 2)

```bash
cd /Users/cp/Documents/security/sentrion-footage/sentrion/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

No Alembic migration is required for this patch.

## 9. Start frontend (Terminal 3)

```bash
cd /Users/cp/Documents/security/sentrion-footage/sentrion/frontend
npm run dev
```

## 10. Add a 4-camera CP PLUS NVR

Sign in → Cameras → Add camera → CP PLUS DVR / NVR.

Enter the NVR address and credentials, leave **Connected camera channels = 4**, click **Test NVR channels**, select the working channels, rename them, then click **Add selected cameras**.

Open **Live Monitoring** and select a saved camera. Sentrion will register the RTSP source in MediaMTX and embed its WebRTC live view.
