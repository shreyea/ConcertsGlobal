# Globe Interaction Features - Implementation Guide

## ✅ Implemented Features

### 1. **Zoom Control with Explicit Gestures Only**
- **Normal Scrolling**: Does NOT zoom the globe
- **Zoom Options**:
  - **Trackpad Pinch**: Native pinch-to-zoom gesture works
  - **Mouse Wheel + Ctrl/Cmd Key**: Hold Ctrl (Windows/Linux) or Cmd (Mac) while scrolling
- **Implementation**: Custom wheel event handler prevents default scroll zoom behavior

### 2. **Globe Press & Hold Interaction**

#### On Mouse Down (Press on Globe):
- ✅ All homepage elements fade out smoothly (0.6s transition)
  - Top section (Stats + Filters) fades out
  - Event cards section fades out
- ✅ Globe background expands to fullscreen
  - Smooth 0.6s animation using CSS transitions
  - Z-index increases to 50 for proper layering
  - Border radius removed for edge-to-edge display
- ✅ Globe itself remains the same size (no scaling)
- ✅ Header remains visible and functional

#### On Mouse Up (Release):
- ✅ All homepage elements fade back in smoothly (0.6s transition)
- ✅ Globe background shrinks back to original container size
- ✅ Globe size unchanged throughout

### 3. **Smooth Animations**
- All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, professional animations
- Fade duration: 0.6 seconds
- Transform duration: 0.6 seconds

## 🔧 Technical Implementation

### Files Modified:

1. **`src/components/Globe.jsx`**
   - Added `isActive` prop to track fullscreen state
   - Added wheel event handler for zoom control
   - Added `controlsRef` for OrbitControls
   - Configured OrbitControls with zoom limits (4-10 distance)
   - Applied conditional `globe-fullscreen` class
   - Uses a `group` rotation so the sphere texture and latitude/longitude markers stay synchronized without mirroring
   - Loads procedurally generated `earth_latlong_texture.png` for precise marker alignment

2. **`src/pages/Home.jsx`**
   - Added `fade-out` class to top-section when globe is active
   - Added `fade-out` class to cards-section when globe is active
   - Passed `isActive` prop to Globe component
   - Fixed duplicate top-section rendering

3. **`src/styles/global.css`**
   - Added `.fade-out` class with opacity and pointer-events control
   - Updated `.globe-area-60.globe-fullscreen` for fullscreen mode
   - Added transitions to `.top-section` and `.cards-section`
   - Improved `.cards-section` with flex-wrap and proper spacing

4. **`scripts/generateEarthTexture.js`**
   - Node script that draws an equirectangular Earth texture with a 15° graticule using `canvas`, `d3-geo`, and `world-atlas`
   - Outputs `public/earth_latlong_texture.png` to ensure latitude/longitude markers land accurately

### Regenerating the Globe Texture

Run the helper script whenever you want a fresh texture (for example, to tweak colors or grid density):

```bash
npm run generate:texture
```

The command exports `public/earth_latlong_texture.png` (4096x2048 equirectangular map) with highlighted meridians, parallels, and country outlines. Because the projection matches the `latLngToXYZ` helper, event markers should align perfectly with their geographic coordinates.

### CSS Classes:

```css
/* Fullscreen globe container */
.globe-area-60.globe-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  margin: 0;
  border-radius: 0;
}

/* Fade out animation */
.fade-out {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🎮 User Experience Flow

1. **Default State**:
   - Globe in 60vh container
   - All elements visible
   - Normal page scrolling works

2. **Click & Hold Globe**:
   - Stats and filters fade out
   - Event cards fade out
   - Globe container expands to fullscreen
   - Globe remains same size (visual focus)
   - User can still rotate the globe

3. **Release Click**:
   - Everything fades back in
   - Globe container shrinks to original size
   - Page returns to normal state

## 🎨 Design Decisions

- **Why header stays visible**: Navigation always accessible
- **Why 0.6s animation**: Smooth but not too slow
- **Why cubic-bezier easing**: Professional feel with acceleration/deceleration
- **Why pointer-events: none**: Prevents interaction with hidden elements
- **Why z-index: 50**: Above content but below modals (typically 100+)

## 🚀 Future Enhancements (Optional)

- Add escape key to exit fullscreen mode
- Add fullscreen toggle button
- Add zoom level indicator
- Add animation for markers during transition
- Add touch gesture support for mobile
