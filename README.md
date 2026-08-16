# Alwaki Player - Vanilla JS WebOS App

A fast, clean, and native video player built with pure Vanilla JavaScript for webOS TVs.

## 🚀 Features

- **Pure Vanilla JS** - No frameworks, no dependencies, maximum performance
- **Native webOS Integration** - Optimized for TV remote navigation
- **Lightweight** - Only 25KB minified source code
- **Smooth Animations** - Hardware-accelerated CSS transitions
- **Keyboard Navigation** - Full support for TV remote arrow keys
- **Dark Mode** - Easy on the eyes for living room viewing
- **Video Categories** - Filter by Music, Movies, Sports, News
- **Search Functionality** - Quick video discovery
- **History Tracking** - Resume watching where you left off
- **Settings Persistence** - Your preferences saved locally

## 📁 Project Structure

```
/workspace
├── src/                    # Source files
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styles (CSS variables, animations)
│   ├── app.js              # Vanilla JS application logic
│   ├── appinfo.json        # webOS app configuration
│   └── assets/             # Icons and images
│       ├── icons/
│       └── images/
├── dist/                   # Built/minified files
├── build.js                # Build script (minification)
└── README.md               # This file
```

## 🛠️ Development

### Prerequisites
- Node.js (v14 or higher)
- webOS CLI tools (optional, for TV deployment)

### Local Development
```bash
cd /workspace/src
npx serve .
```

Then open `http://localhost:3000` in your browser.

### Build for Production
```bash
cd /workspace
node build.js
```

This creates optimized files in the `dist/` directory:
- Minified HTML, CSS, and JS
- Removed comments and whitespace
- ~70% size reduction

## 📺 Install on webOS TV

### Option 1: Using webOS CLI
```bash
# Package as IPK
cd /workspace/dist
ares-package .

# Install on TV
ares-install com.alwaki.player_1.0.0_all.ipk

# Launch the app
ares-launch com.alwaki.player
```

### Option 2: Developer Mode
1. Enable Developer Mode on your LG TV
2. Connect to the same network
3. Use the Device Connection Manager
4. Upload the `dist` folder contents

## 🎮 Remote Control Navigation

| Key | Action |
|-----|--------|
| ⬆️⬇️⬅️➡️ Arrow Keys | Navigate videos |
| OK/Enter | Select/Play video |
| Back/Escape | Go back |
| Space | Play/Pause |

## 🎨 Customization

### Change Theme Colors
Edit `src/styles.css` CSS variables:
```css
:root {
    --primary-color: #0078d4;
    --background-dark: #1a1a1a;
    --text-primary: #ffffff;
}
```

### Add More Videos
Edit the `sampleVideos` array in `src/app.js`:
```javascript
const sampleVideos = [
    { 
        id: 9, 
        title: 'Your Video', 
        category: 'music', 
        duration: '3:45', 
        thumbnail: 'url', 
        url: 'video-url' 
    }
];
```

## 📊 Performance Stats

After running `node build.js`:

| File | Size |
|------|------|
| index.html | 4.35 KB |
| styles.css | 10.52 KB |
| app.js | 10.45 KB |
| **Total** | **25.32 KB** |

## 🔧 Technical Highlights

- **Zero Dependencies** - Pure vanilla JavaScript
- **ES6+ Features** - Arrow functions, template literals, destructuring
- **LocalStorage** - Persistent settings and history
- **Event Delegation** - Efficient event handling
- **CSS Variables** - Easy theming
- **Hardware Acceleration** - Smooth 60fps animations
- **Responsive Design** - Works on all screen sizes
- **Lazy Loading** - Images load on demand

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

Built with ❤️ using Vanilla JavaScript
