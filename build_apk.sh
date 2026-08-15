#!/usr/bin/env bash
set -e

WORKSPACE_DIR="$(pwd)"
TOOLS_DIR="$WORKSPACE_DIR/.tools"
mkdir -p "$TOOLS_DIR"

# 1. Download OpenJDK 21 if not present
if [ ! -x "$TOOLS_DIR/jdk-21/bin/java" ]; then
  echo "Installing OpenJDK 21..."
  mkdir -p "$TOOLS_DIR/jdk-21"
  curl -fsSL "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz" -o /tmp/jdk21.tar.gz
  tar -xzf /tmp/jdk21.tar.gz -C "$TOOLS_DIR/jdk-21" --strip-components=1
  rm -f /tmp/jdk21.tar.gz
fi

# 2. Download Gradle 8.14.3 if not present
if [ ! -x "$TOOLS_DIR/gradle-8.14.3/bin/gradle" ]; then
  echo "Installing Gradle 8.14.3..."
  curl -fsSL "https://downloads.gradle.org/distributions/gradle-8.14.3-bin.zip" -o /tmp/gradle.zip
  unzip -q -o /tmp/gradle.zip -d "$TOOLS_DIR"
  rm -f /tmp/gradle.zip
  chmod +x "$TOOLS_DIR/gradle-8.14.3/bin/gradle"
fi

# 3. Download Android SDK Command Line Tools if not present
if [ ! -x "$TOOLS_DIR/android-sdk/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "Installing Android Command Line Tools..."
  mkdir -p "$TOOLS_DIR/android-sdk/cmdline-tools"
  curl -fsSL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o /tmp/cmdline-tools.zip
  unzip -q -o /tmp/cmdline-tools.zip -d "$TOOLS_DIR/android-sdk/cmdline-tools"
  rm -rf "$TOOLS_DIR/android-sdk/cmdline-tools/latest"
  mv "$TOOLS_DIR/android-sdk/cmdline-tools/cmdline-tools" "$TOOLS_DIR/android-sdk/cmdline-tools/latest"
  rm -f /tmp/cmdline-tools.zip
fi

export JAVA_HOME="$TOOLS_DIR/jdk-21"
export ANDROID_HOME="$TOOLS_DIR/android-sdk"
export PATH="$JAVA_HOME/bin:$TOOLS_DIR/gradle-8.14.3/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "Accepting Android SDK licenses and installing packages..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platform-tools" "platforms;android-35" "platforms;android-36" "build-tools;35.0.0" "build-tools;36.0.0"

echo "Building web assets and syncing Capacitor..."
npm run build
npx cap sync android

echo "Regenerating valid Gradle wrapper for Gradle 8.14.3..."
cd "$WORKSPACE_DIR/android"
"$TOOLS_DIR/gradle-8.14.3/bin/gradle" wrapper --gradle-version 8.14.3 --distribution-type all
chmod +x gradlew

echo "Testing wrapper version..."
./gradlew --version

echo "Running Gradle assembleDebug..."
./gradlew assembleDebug --stacktrace

echo "Copying APK to public/..."
mkdir -p "$WORKSPACE_DIR/public/downloads"
find "$WORKSPACE_DIR/android" -name "*.apk" -exec cp -vf {} "$WORKSPACE_DIR/public/downloads/" \;
find "$WORKSPACE_DIR/android" -name "*.apk" -exec cp -vf {} "$WORKSPACE_DIR/public/BuyWise.apk" \;
find "$WORKSPACE_DIR/android" -name "*.apk" -exec cp -vf {} "$WORKSPACE_DIR/public/buywise-app-debug.apk" \;

echo "Build complete! APKs found:"
find "$WORKSPACE_DIR/public" -name "*.apk" -ls
find "$WORKSPACE_DIR/android/app/build/outputs/apk" -name "*.apk" -ls
