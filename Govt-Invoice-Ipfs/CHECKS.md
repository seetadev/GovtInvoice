# 🔍 Code Analysis & Security Audit

> **Generated:** February 4, 2026  
> **Project:** Invoice Android App v2.0.0

---

## 📊 Summary

| Category | Score | Status |
|----------|-------|--------|
| Signing Security | 1/10 | 🔴 Critical |
| Code Obfuscation | 2/10 | 🔴 Critical |
| Network Security | 5/10 | 🟠 Needs Work |
| Dependencies | 6/10 | 🟠 Needs Updates |
| SDK Versions | 9/10 | ✅ Good |
| WebView Config | 7/10 | 🟠 Good with caveats |

**Overall: 5/10 - Significant improvements needed before production release**

---

## 🔴 CRITICAL ISSUES

### 1. Hardcoded Signing Passwords
**File:** `android/app/build.gradle` (Lines 20-25)

```gradle
signingConfigs {
    release {
        storeFile file("my-release-key.keystore")
        storePassword "password"     // ⛔ HARDCODED!
        keyAlias "my-key-alias"
        keyPassword "password"        // ⛔ HARDCODED!
    }
}
```

**Risk:** Credentials exposed in version control. Anyone with repo access can sign releases.

**Fix:** Use environment variables or `local.properties`:
```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_FILE") ?: "release-key.jks")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

---

### 2. ProGuard/R8 Disabled
**File:** `android/app/build.gradle` (Line 33)

```gradle
buildTypes {
    release {
        minifyEnabled false  // ⛔ Code obfuscation DISABLED
    }
}
```

**Risk:** 
- App code can be easily reverse-engineered
- Business logic exposed
- Larger APK size (no dead code elimination)

**Fix:**
```gradle
release {
    minifyEnabled true
    shrinkResources true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
```

---

### 3. `eval()` Usage - XSS Vulnerability
**File:** `src/components/InvoicePage/socialcalc/socialcalc.js` (~Line 7562)

```javascript
j = eval("(" + text + ")");  // ⛔ Dangerous!
```

**Risk:** If `text` comes from user input, this is an XSS vulnerability.

**Fix:** Replace with `JSON.parse()`:
```javascript
j = JSON.parse(text);
```

---

### 4. App ID Mismatch
**Files:** `capacitor.config.ts` vs `android/app/build.gradle`

| File | App ID |
|------|--------|
| `capacitor.config.ts` | `com.example.app` (placeholder!) |
| `build.gradle` | `com.aspiring.invoice` |

**Fix:** Update `capacitor.config.ts`:
```typescript
appId: "com.aspiring.invoice",
```

---

### 5. Wildcard CORS Access
**File:** `android/app/src/main/res/xml/config.xml`

```xml
<access origin="*" />  <!-- ⛔ Allows ANY origin -->
```

**Risk:** Potential XSS/CSRF vulnerability.

**Fix:** Restrict to specific domains:
```xml
<access origin="https://your-api-domain.com" />
```

---

## 🟠 VERSION MISMATCHES

| Package | Installed | Expected | Action |
|---------|-----------|----------|--------|
| `@types/react` | ^18.0.27 | ^19.x | Update (React 19.2.4) |
| `@types/react-dom` | ^18.0.10 | ^19.x | Update |
| `react-router` | ^5.3.4 | v6+ | Upgrade recommended |
| `@types/html2canvas` | ^0.5.35 | - | Remove (deprecated) |
| `sql.js` | ^1.8.0 | 1.10+ | Update for patches |

**Fix in `package.json`:**
```json
{
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0"
}
```

---

## ⚠️ CODE QUALITY ISSUES

### 1. Empty Catch Blocks (Silent Failures)

**Files affected:**
- `src/services/local-template-service.ts` (Line ~237)
- `src/data/repositories/*.ts`

```typescript
// ❌ Bad - Swallows errors silently
} catch (e) { }

// ✅ Good - Log or rethrow
} catch (error) {
    console.error("Operation failed:", error);
    throw error;
}
```

---

### 2. Memory Leaks - Missing Cleanup

**File:** `src/pages/InvoicePage.tsx`

```typescript
// ❌ Bad - Interval not cleaned up on unmount
const interval = setInterval(updateSocialCalcCurrency, 500);
setTimeout(() => clearInterval(interval), 3000);

// ✅ Good - Clean up in useEffect return
useEffect(() => {
    const interval = setInterval(updateSocialCalcCurrency, 500);
    return () => clearInterval(interval);
}, []);
```

---

### 3. Hardcoded Localhost

**Files:** Various service files

```typescript
// ❌ Bad
const API_BASE_URL = "http://localhost:8000";

// ✅ Good - Use environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.example.com";
```

---

### 4. Console.log in Production

**~20+ instances across:**
- `src/App.tsx`
- `src/components/InvoiceForm.tsx`
- Various service files

**Fix:** Remove or wrap with environment check:
```typescript
if (import.meta.env.DEV) {
    console.log('Debug info:', data);
}
```

---

### 5. Missing Error Boundaries

No React Error Boundaries found. If any component throws during render, the entire app crashes.

**Fix:** Add to `src/App.tsx`:
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
    return <div>Something went wrong: {error.message}</div>;
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
</ErrorBoundary>
```

---

### 6. Missing useEffect Dependencies

**File:** `src/pages/DashboardHome.tsx`

```typescript
// ❌ Bad - Missing dependencies
useEffect(() => {
    loadData();
}, []);

// ✅ Good - Include dependencies or use useCallback
const loadData = useCallback(async () => { ... }, [dependencies]);
useEffect(() => {
    loadData();
}, [loadData]);
```

---

## 🛡️ ANDROID SECURITY ISSUES

### 1. Backup Enabled
**File:** `android/app/src/main/AndroidManifest.xml`

```xml
android:allowBackup="true"  <!-- ⚠️ Exposes app data -->
```

**Fix:**
```xml
android:allowBackup="false"
```

---

### 2. Missing Network Security Config

**Action Required:** Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

Add to `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

---

### 3. Lint Checks Disabled
**File:** `android/app/build.gradle`

```gradle
lintOptions {
    checkReleaseBuilds false  // ⛔ Security checks disabled
    abortOnError false
}
```

**Fix:**
```gradle
lintOptions {
    checkReleaseBuilds true
    abortOnError true
}
```

---

### 4. File Provider Exposes All Storage
**File:** `android/app/src/main/res/xml/file_paths.xml`

```xml
<external-path name="my_images" path="." />  <!-- ⛔ Entire storage! -->
```

**Fix:** Restrict to specific directories:
```xml
<external-path name="my_images" path="Pictures/" />
```

---

## 📋 UNUSED CODE

| File | Unused Imports |
|------|----------------|
| `src/pages/DashboardHome.tsx` | `DATA`, `tempMeta`, `LocalFile` (commented) |
| `src/components/DashboardSidebar.tsx` | `peopleOutline`, `calendarOutline`, etc. |
| `src/pages/SettingsPage.tsx` | Multiple unused Ionic icons |
| `src/pages/InvoicePage.tsx` | `IonGrid`, `IonRow`, `IonCol` |

---

## ✅ WHAT'S GOOD

- ✅ SDK versions are up-to-date (targetSdk 35, minSdk 24)
- ✅ Capacitor packages consistent at v8
- ✅ Ionic packages aligned at v8.7.17
- ✅ HTTPS scheme configured for WebView
- ✅ Parameterized SQL queries (mostly safe)
- ✅ TypeScript used throughout

---

## 🎯 PRIORITY ACTION ITEMS

### 🔴 Immediate (Before Release)
- [ ] Move signing credentials to environment variables
- [ ] Enable ProGuard: `minifyEnabled true`
- [ ] Fix `capacitor.config.ts` appId
- [ ] Replace `eval()` with `JSON.parse()` in socialcalc

### 🟠 High Priority
- [ ] Add Error Boundaries around major components
- [ ] Update React types to v19
- [ ] Add `network_security_config.xml`
- [ ] Remove/gate console.log statements

### 🟡 Medium Priority
- [ ] Fix useEffect cleanup for intervals/timers
- [ ] Add proper error handling (don't swallow errors)
- [ ] Upgrade react-router to v6
- [ ] Remove unused imports
- [ ] Disable `allowBackup` or use encryption

---

## 📚 References

- [Android Security Best Practices](https://developer.android.com/topic/security/best-practices)
- [Capacitor Security Guide](https://capacitorjs.com/docs/guides/security)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [ProGuard Configuration](https://developer.android.com/studio/build/shrink-code)

The root issue is @bcyesil/capacitor-plugin-printer@0.0.5 declares a peer dependency on @capacitor/core@^6.0.0 but your project uses Capacitor 8. The simplest permanent fix is to add a project-level .npmrc so the flag is always applied automatically:

