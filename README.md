# TaskMatrix

**TaskMatrix** is a modern, flexible, and smart personal task manager built with **React**, **Vite**, and **TailwindCSS**.
It focuses on powerful task creation, reminders, scheduling, templates, geofencing, and optional AI-assisted planning — all designed to help you organize your day effortlessly.

---

## Author

**Naren S J**

**Contact**

* **Email:** [narensonu1520@gmail.com](mailto:narensonu1520@gmail.com)
* **Phone:** +91 82968 33381
* **GitHub:** [Naren1520](https://github.com/Naren1520)

---
## Deployment
* https://task-matrix-three.vercel.app/

##  Features at a Glance

###  Task Management

* Fast creation, editing, and organization of tasks
* Notes, links, and file attachments
* Recurring tasks with flexible rules (daily, weekly, custom)

###  Reminders & Alarms

* Custom ringtones with trimming support
* Alarm volume & playback settings
* Notifications with optional snooze
* Works even while using other tabs (browser permission required)

### Location-Based Reminders (Geofencing)

* Trigger reminders when entering or leaving an area
* Adjustable radius for accuracy
* Lightweight geofencing module optimized for battery/performance

### Planning & Views

* **Calendar View:** Date-first planning
* **Timeline / Gantt View:** Visual scheduling made simple
* Drag & drop (if enabled) for quick date adjustments

### Templates & Plugins

* Create reusable templates for recurring task formats
* Optional plugin modules:

  * Habit tracker
  * Water intake tracker
  * Basic budgeting
  * Custom plugin support

### Weather Integration (Optional)

* Uses OpenWeatherMap
* Weather-based suitability suggestions (e.g., “Good time for outdoor tasks”)
* City persists via `localStorage`

### AI Assistant (Optional)

* Smart task suggestions
* Auto-generates routines, habit plans & priority sorting
* Requires configuration in `aiService.js` or env variables

### Customization

* Dark/Light theme toggle
* Accessibility helpers (reduced motion, dyslexia-friendly fonts)
* Clean layout powered by TailwindCSS

---

## Development Setup

### **Requirements**

* **Node.js 16+**
* **npm** (or **yarn**)

---

### **Install Dependencies**

```powershell
cd "c:\Users\Naren S J\Downloads\Todo website"
npm install
```

### **Run Development Server**

```powershell
npm run dev
```

### **Build for Production**

```powershell
npm run build
```

### **Preview Production Build**

```powershell
npm run preview
```

---

##  Environment Variables

TaskMatrix uses Vite, so all environment variables must start with **`VITE_`**.

| Variable               | Description                       | Example                                   |
| ---------------------- | --------------------------------- | ----------------------------------------- |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap API key (optional) | `abc123...`                               |
| `VITE_WEATHER_API_URL` | Weather API base URL              | `https://api.openweathermap.org/data/2.5` |
| `VITE_ENABLE_WEATHER`  | Enable/disable weather widget     | `true`                                    |
| `VITE_ENABLE_AI`       | Enable AI features                | `false`                                   |

### Example `.env`

```
VITE_WEATHER_API_KEY=your_api_key_here
VITE_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
VITE_ENABLE_WEATHER=true
VITE_ENABLE_AI=false
```

---

## 📝 Notes & Tips

* **Reset weather city:**
  Run this in browser console:
  `localStorage.removeItem('weather_city')`
* **Alarm audio not playing?**
  Check browser sound permissions + Alarm volume settings.
* **Location-based reminders:**
  Require location permission and may take a few seconds to activate after page load.
* **Backup & migration:**
  Use **Import/Export** to save tasks as JSON anytime.

---

##  Folder Structure (Recommended Overview)

```
src/
 ├─ components/       # Reusable UI blocks
 ├─ pages/            # Main views (Home, Calendar, Timeline, etc.)
 ├─ features/         # Plugins & optional modules
 ├─ hooks/            # Custom hooks
 ├─ utils/            # Helper functions
 ├─ services/         # API, weather, AI, local storage services
 ├─ styles/           # Global Tailwind overrides
 └─ assets/           # Icons, sounds, images
```

---

##  Future Enhancements (Planned)

* Voice task creation
* Smart routines powered by on-device context

---

##  Contributing

Pull requests are welcome!
For major changes, please open an issue to discuss what you’d like to modify.

---

**TaskMatrix — Your personal productivity companion, built with care and creativity.**
