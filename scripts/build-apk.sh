#!/usr/bin/env bash
# İmzalı release APK'sını tek komutla üretir: npm run apk
# Çıktı: release/simyacinin-sirri-<sürüm>.apk
set -euo pipefail
cd "$(dirname "$0")/.."

PROPS="${SIMYA_KEYSTORE_PROPERTIES:-$(cd .. && pwd)/simya-signing/keystore.properties}"
if [[ ! -f "$PROPS" ]]; then
  echo "HATA: İmzalama ayarları bulunamadı: $PROPS" >&2
  echo "Keystore'u ve keystore.properties dosyasını oraya koyun (bkz. CLAUDE.md > İmzalama)." >&2
  exit 1
fi
export SIMYA_KEYSTORE_PROPERTIES="$PROPS"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

VERSION=$(node -p "require('./package.json').version")
echo "› Web paketi derleniyor (v$VERSION)"
npm run build
echo "› Capacitor eşitleniyor"
npx cap sync android
echo "› Android release derleniyor"
for i in 1 2 3; do (cd android && ./gradlew --no-daemon -q --max-workers=1 assembleRelease) && break; echo "Gradle yeniden deneniyor ($i)"; sleep 15; done

APK=android/app/build/outputs/apk/release/app-release.apk
mkdir -p release
OUT="release/simyacinin-sirri-$VERSION.apk"
cp "$APK" "$OUT"
echo "› İmza doğrulanıyor"
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --print-certs "$OUT" | grep -E "SHA-256|Signer" || true
echo "✓ Hazır: $OUT"
