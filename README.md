# Alwaki Player - Vanilla JS webOS App

A clean, fast, and lightweight video player app built with 100% Vanilla JavaScript for webOS TV platforms.

## Features

✅ **100% Vanilla JavaScript** - Zero dependencies, ultra-lightweight  
✅ **Native webOS Integration** - Proper appinfo.json configuration  
✅ **Smooth 60fps Animations** - Hardware-accelerated CSS transitions  
✅ **TV Remote Navigation** - Full arrow key and back button support  
✅ **Dark Mode UI** - Optimized for living room viewing  
✅ **Video Categories** - Movies, Series, Documentaries, Kids  
✅ **Search Functionality** - Real-time video filtering  
✅ **Watch History** - Persistent localStorage tracking  
✅ **Responsive Design** - Works on all screen sizes  

## File Structure

```
/workspace
├── src/              # Source files (development)
│   ├── index.html    # Main HTML file
│   ├── styles.css    # Stylesheet
│   ├── app.js        # Application logic
│   ├── appinfo.json  # webOS app manifest
│   ├── icon.png      # 80x80 app icon
│   └── largeIcon.png # 130x130 large icon
├── dist/             # Production build (minified)
└── build.cjs         # Build script
```

## Quick Start

### Development Mode
```bash
cd /workspace/src
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

### Build for Production
```bash
node /workspace/build.cjs
```

### Package as IPK
```bash
cd /workspace/dist
ares-package .
```

### Install on webOS TV
```bash
ares-install com.alwaki.player_1.0.0_all.ipk
ares-launch com.alwaki.player
```

## Build Output

The production build minifies all assets:
- **index.html**: ~1.35 KB
- **styles.css**: ~4.52 KB  
- **app.js**: ~4.52 KB
- **Total**: ~10.39 KB (ultra-lightweight!)

## webOS Configuration

The app includes proper webOS metadata:
- App ID: `com.alwaki.player`
- Version: `1.0.0`
- Background color matching UI theme
- GIP (Game Input Protocol) support
- Touch mode disabled (TV-optimized)

## Keyboard/Remote Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate between videos |
| Enter/OK | Play selected video |
| Back/Escape | Close player or go back |
| Tab | Focus navigation |

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, animations, backdrop-filter
- **Vanilla JavaScript** - ES6+ features, no frameworks
- **localStorage** - Persistent watch history
- **webOS SDK** - Native TV integration

## Performance

- ⚡ **Fast Load**: <11KB total bundle size
- 🎬 **60fps Animations**: Cubic-bezier easing functions
- 💾 **Minimal Memory**: No framework overhead
- 🔋 **Efficient**: Hardware-accelerated transforms

## License

MIT License - Free to use and modify
