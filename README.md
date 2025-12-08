# TaskMatrix

TaskMatrix is a personal task manager / todo web app built with React, Vite and TailwindCSS. It focuses on flexible task creation, scheduling, reminders, templates and integrations that help you organize daily work and life.

**Author:** Naren S J

**Contact:**
- Email: narensonu1520@gmail.com
- Phone: +91 82968 33381
- GitHub: Naren1520

---

**Key Features**
- Create, edit, and manage tasks quickly
- Alarms & reminders with custom ringtones and trimming
- Location-based reminders (geofencing) with adjustable radius
- Recurring tasks and flexible recurrence rules
- Attach notes, links and files to tasks
- Templates for reusable task definitions
- Timeline/Gantt view for scheduling tasks
- Calendar view for date-based planning
- Analytics for task statistics and trends
- Import/Export for backup and transfer (JSON)
- Plugins system for optional features (Habit, Water, Budget, etc.)
- Weather widget with suitability suggestions (optional)
- AI Assistant & Smart Suggestions (optional)
- Theme selector (dark/light) and accessibility helpers

---

**Quick Start (Development)**

Requirements:
- Node.js (16+ recommended)
- npm (or yarn)

Install dependencies:

```powershell
cd "c:\Users\Naren S J\Downloads\Todo website"
npm install
```

Run dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Preview production build locally:

```powershell
npm run preview
```

---

**Environment Variables**
Create a `.env` or set environment variables with the `VITE_` prefix.

- `VITE_WEATHER_API_KEY` - OpenWeatherMap API key (optional)
- `VITE_WEATHER_API_URL` - OpenWeatherMap base URL (default: `https://api.openweathermap.org/data/2.5`)
- `VITE_ENABLE_WEATHER` - `true` to enable weather widget
- `VITE_ENABLE_AI` - `true` to enable AI features (requires backend/AI config in `aiService.js` or env)

Example `.env`:

```
VITE_WEATHER_API_KEY=your_api_key_here
VITE_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
VITE_ENABLE_WEATHER=true
VITE_ENABLE_AI=false
```

---

**Notes & Tips**
- Weather widget stores selected city in `localStorage` under the key `weather_city`. To reset it in the browser console run: `localStorage.removeItem('weather_city')` then refresh.
- Alarms rely on browser audio playback permissions; if audio does not play automatically, verify site permissions and Settings -> Alarm volume.
- Geofencing works after the initial loader period; ensure location permission is allowed in the browser.

---

**Contributing**
Contributions are welcome. Open an issue or submit a PR. Please include a clear description and, when relevant, a minimal reproduction.

---

**License**
This project does not include a license file. Add one (e.g., MIT) if you intend to open-source it.
