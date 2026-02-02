# 🏭 Industrial Digital Twin - Paint Mixing Station

**Live Demo:** [View on GitHub Pages](https://maxdev-cathode.github.io/industrial-digital-twin/)

![SCADA Dashboard Preview](preview.png)

## 📋 Project Overview

A professional, browser-based SCADA (Supervisory Control and Data Acquisition) simulation demonstrating real-time industrial process visualization. This project showcases:

- **Real-time process simulation** - Tank levels, flow rates, and temperature
- **Interactive controls** - Clickable valves, agitator control, batch management
- **Live analytics** - Chart.js powered real-time graphs
- **Safety interlocks** - Automatic protection against overflow and dry-run conditions
- **Industrial design** - Professional dark-mode SCADA aesthetic

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, animations, responsive grid |
| **Vanilla JavaScript** | State management, simulation engine |
| **Chart.js** | Real-time data visualization |

**No backend required** - Runs entirely in the browser.

## ✨ Features

### Process Visualization
- 3 animated tanks with dynamic liquid levels
- Color-coded materials (Pigment, Base, Mixed Product)
- Animated flow indicators in pipes

### Control System
- **Valve V1/V2** - Toggle open/closed with visual feedback
- **Agitator Motor** - Start/stop with safety checks
- **Quick Actions** - Start Batch, Emergency Stop, Reset

### Safety Interlocks
- **Overflow Protection** - Auto-closes valves at 95% mixer level
- **Dry-Run Protection** - Stops agitator below 10% mixer level
- **Low-Level Warnings** - Alerts when source tanks are depleted

### Analytics Dashboard
- Real-time tank level chart
- Temperature and flow rate monitoring
- 50-point rolling history

## 🚀 Quick Start

### Option 1: Local
1. Clone the repository
2. Open `index.html` in your browser
3. Click "START BATCH" to begin simulation

### Option 2: GitHub Pages
1. Fork this repository
2. Go to Settings → Pages → Source: `main` branch
3. Access at `https://YOUR-USERNAME.github.io/industrial-digital-twin/`

## 📁 File Structure

```
industrial-digital-twin/
├── index.html      # Main HTML structure
├── style.css       # SCADA-themed styling
├── simulation.js   # Process logic & state management
└── README.md       # This file
```

## 🎯 Use Cases

This project demonstrates competency in:
- **Industrial Automation** - Understanding of SCADA/HMI concepts
- **Frontend Development** - Modern CSS, responsive design
- **Real-time Systems** - State management, simulation loops
- **Data Visualization** - Chart.js integration

## 📝 License

MIT License - Free for personal and commercial use.

---

**Built with ❤️ by MaXDev** | [GitHub](https://github.com/MaXDev-CATHODE)
