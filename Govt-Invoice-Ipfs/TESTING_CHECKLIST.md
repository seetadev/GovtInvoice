# Quick Reference: Edge-to-Edge Testing Checklist

## Before Deployment

### Prerequisites
- [ ] Node.js >=22.0.0 installed
- [ ] `npx cap sync android` completed successfully
- [ ] App builds without errors: `npm run build`

## Testing Checklist

### Android 15 (API 35) - Primary Target

#### Visual Tests
- [ ] App launches successfully
- [ ] Status bar is transparent and overlays content
- [ ] Navigation bar is transparent and overlays content
- [ ] Status bar icons are visible (correct contrast)
- [ ] Navigation bar icons are visible (correct contrast)
- [ ] No content is hidden behind system UI
- [ ] Safe areas are respected (notch, camera cutout)

#### Functional Tests
- [ ] All pages load correctly
- [ ] Page transitions work smoothly
- [ ] Screen rotation maintains proper layout
- [ ] Status bar style changes work (light/dark)
- [ ] Modal dialogs display correctly
- [ ] Bottom sheets display correctly

#### Edge Cases
- [ ] Device with notch/punch-hole camera
- [ ] Device with curved display edges
- [ ] Landscape orientation
- [ ] Gesture navigation mode
- [ ] 3-button navigation mode

### Android 14 (API 34) - Backward Compatibility
- [ ] App launches successfully
- [ ] Status bar displays correctly
- [ ] Navigation bar displays correctly
- [ ] All functionality works as expected

### Android 12 (API 31) - Older Devices
- [ ] App launches successfully
- [ ] UI renders correctly
- [ ] No crashes or errors

## Console Verification

### After Upload to Play Console
1. **Upload APK/AAB** to Internal Testing
2. **Wait for pre-launch report** (usually 1-2 hours)
3. **Check for warnings**:
   - [ ] No edge-to-edge warnings
   - [ ] No deprecated API warnings
   - [ ] Pre-launch tests pass

## Common Issues & Fixes

### Issue: Content hidden behind status bar
**Fix**: Add CSS safe area insets
```css
.page-header {
  padding-top: env(safe-area-inset-top);
}
```

### Issue: Status bar icons not visible
**Fix**: Adjust StatusBar style in useStatusBar hook
```typescript
useStatusBar({ style: 'dark', overlaysWebView: true });
```

### Issue: Layout shifts on rotation
**Fix**: Ensure all layouts use safe-area-inset CSS variables

## Test Devices Recommended

### Minimum Test Matrix
| Device Type | Android Version | Purpose |
|-------------|-----------------|---------|
| Pixel 8/9 | Android 15 | Primary target |
| Samsung Galaxy | Android 14 | Backward compatibility |
| Budget phone | Android 12 | Minimum SDK |
| Tablet | Android 15 | Large screen |

## Success Criteria

✅ All visual tests pass  
✅ All functional tests pass  
✅ No crashes or errors  
✅ Play Console pre-launch report clean  
✅ No deprecated API warnings

## Quick Commands

```bash
# Sync changes
npx cap sync android

# Build and run on device
npx cap run android

# Build release APK
cd android && ./gradlew assembleRelease

# Build release AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

## Debug Commands

```bash
# Check Android version on device
adb shell getprop ro.build.version.release

# View logs
adb logcat | grep -E "StatusBar|EdgeToEdge"

# Check if deprecation warnings appear
adb logcat | grep -i deprecated
```

---

**Quick Win**: Test on Android 15 emulator first to verify edge-to-edge works before physical device testing.
