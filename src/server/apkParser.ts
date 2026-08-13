import AdmZip from "adm-zip";

export interface ApkMetadata {
  isValid: boolean;
  error?: string;
  packageName?: string;
  versionName?: string;
  versionCode?: string;
  fileSize: number;
  fileSizeFormatted: string;
  isManualMeta?: boolean;
}

/**
 * Formats bytes to human readable string (e.g., 52.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Extracts UTF-8 and UTF-16 strings from a buffer or String Pool
 */
function extractStringsFromBuffer(buffer: Buffer): string[] {
  const strings: string[] = [];
  
  // Extract ASCII/UTF-8 readable sequences (length >= 3)
  let currentAscii = "";
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte >= 32 && byte <= 126) {
      currentAscii += String.fromCharCode(byte);
    } else {
      if (currentAscii.length >= 3) {
        strings.push(currentAscii);
      }
      currentAscii = "";
    }
  }
  if (currentAscii.length >= 3) {
    strings.push(currentAscii);
  }

  // Extract UTF-16LE readable sequences
  let currentUtf16 = "";
  for (let i = 0; i < buffer.length - 1; i += 2) {
    const charCode = buffer.readUInt16LE(i);
    if (charCode >= 32 && charCode <= 126) {
      currentUtf16 += String.fromCharCode(charCode);
    } else {
      if (currentUtf16.length >= 3) {
        strings.push(currentUtf16);
      }
      currentUtf16 = "";
    }
  }
  if (currentUtf16.length >= 3) {
    strings.push(currentUtf16);
  }

  return strings;
}

/**
 * Validates an uploaded APK buffer and extracts package & version metadata.
 */
export function parseAndValidateApk(buffer: Buffer, originalFilename: string, expectedPackage = "store.buywise.app"): ApkMetadata {
  const fileSize = buffer.length;
  const fileSizeFormatted = formatFileSize(fileSize);

  // 1. Basic ZIP Header Check (PK\x03\x04 = 0x504B0304)
  if (fileSize < 30 || buffer.readUInt32LE(0) !== 0x04034b50) {
    return {
      isValid: false,
      error: "Please select a valid APK file. The file is corrupted or not a valid Android package.",
      fileSize,
      fileSizeFormatted,
    };
  }

  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    
    // Check for AndroidManifest.xml
    const manifestEntry = entries.find((e) => e.entryName === "AndroidManifest.xml");
    if (!manifestEntry) {
      return {
        isValid: false,
        error: "Invalid APK: AndroidManifest.xml is missing from the Android package.",
        fileSize,
        fileSizeFormatted,
      };
    }

    // Check for classes.dex or resources.arsc or META-INF
    const hasDexOrArsc = entries.some(
      (e) =>
        e.entryName.endsWith(".dex") ||
        e.entryName === "resources.arsc" ||
        e.entryName.startsWith("META-INF/")
    );

    if (!hasDexOrArsc) {
      return {
        isValid: false,
        error: "Invalid APK file structure: Missing Android compiled resources.",
        fileSize,
        fileSizeFormatted,
      };
    }

    // Extract manifest binary data and strings
    const manifestBuffer = manifestEntry.getData();
    const extractedStrings = extractStringsFromBuffer(manifestBuffer);

    // Look for package name matching store.buywise.app or reverse domain pattern
    let foundPackageName = "";
    
    // First priority: check for expected package name directly
    if (extractedStrings.includes(expectedPackage)) {
      foundPackageName = expectedPackage;
    } else {
      // Find strings matching domain pattern like xxx.yyy.zzz or store.buywise...
      const domainMatches = extractedStrings.filter(
        (s) =>
          /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(s) &&
          !s.startsWith("android.") &&
          !s.startsWith("schemas.") &&
          !s.startsWith("http") &&
          !s.endsWith(".xml") &&
          !s.endsWith(".png") &&
          !s.endsWith(".dex")
      );

      if (domainMatches.length > 0) {
        // Look for buywise match first
        const buywiseMatch = domainMatches.find((s) => s.toLowerCase().includes("buywise"));
        foundPackageName = buywiseMatch || domainMatches[0];
      }
    }

    // If package name found and doesn't match expected package:
    if (foundPackageName && foundPackageName !== expectedPackage) {
      // Check if it's another app
      return {
        isValid: false,
        error: `Invalid BuyWise APK. Expected package: ${expectedPackage} (found: ${foundPackageName})`,
        packageName: foundPackageName,
        fileSize,
        fileSizeFormatted,
      };
    }

    // Extract Version Name & Version Code
    let versionName = "";
    let versionCode = "";

    // Search for semver version string in extracted strings (e.g., 1.0.0, 1.2.3, 2.0.1)
    const semverMatches = extractedStrings.filter((s) => /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/.test(s));
    if (semverMatches.length > 0) {
      versionName = semverMatches[0];
    }

    // Search for integer string in extracted strings for versionCode (e.g., 100, 101, 102)
    const codeMatches = extractedStrings.filter((s) => /^\d{2,6}$/.test(s));
    if (codeMatches.length > 0) {
      versionCode = codeMatches[0];
    }

    const finalPackageName = foundPackageName || expectedPackage;
    const isManualMeta = !versionName || !versionCode;

    return {
      isValid: true,
      packageName: finalPackageName,
      versionName: versionName || "1.0.0",
      versionCode: versionCode || "100",
      fileSize,
      fileSizeFormatted,
      isManualMeta,
    };
  } catch (e: any) {
    return {
      isValid: false,
      error: `Failed to inspect APK archive: ${e.message}`,
      fileSize,
      fileSizeFormatted,
    };
  }
}
