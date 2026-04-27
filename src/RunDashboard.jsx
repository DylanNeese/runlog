import { useState, useEffect } from "react";

// City presets with their lat/lng for Open Meteo (no API key needed)
const CITIES = [
  { name: "New York",    lat: 40.71, lng: -74.01 },
  { name: "Chicago",     lat: 41.88, lng: -87.63 },
  { name: "Los Angeles", lat: 34.05, lng: -118.24 },
  { name: "Boston",      lat: 42.36, lng: -71.06 },
  { name: "Denver",      lat: 39.74, lng: -104.98 },
];

function buildUrl(lat, lng) {
  return (
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weathercode` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
  );
}

// WMO weather code → label + emoji
function decodeWeather(code) {
  if (code === 0)               return { label: "Clear sky",         icon: "☀️" };
  if (code <= 2)                return { label: "Partly cloudy",     icon: "⛅" };
  if (code === 3)               return { label: "Overcast",          icon: "☁️" };
  if (code <= 49)               return { label: "Foggy",             icon: "🌫️" };
  if (code <= 57)               return { label: "Drizzle",           icon: "🌦️" };
  if (code <= 67)               return { label: "Rain",              icon: "🌧️" };
  if (code <= 77)               return { label: "Snow",              icon: "❄️" };
  if (code <= 82)               return { label: "Rain showers",      icon: "🌧️" };
  if (code <= 86)               return { label: "Snow showers",      icon: "🌨️" };
  return                               { label: "Thunderstorm",      icon: "⛈️" };
}

function runScore(temp, wind, precip, code) {
  let score = 100;
  // Ideal running temp: 45–65°F
  if (temp < 20 || temp > 95) score -= 50;
  else if (temp < 35 || temp > 85) score -= 25;
  else if (temp < 45 || temp > 70) score -= 10;
  // Wind
  if (wind > 25) score -= 30;
  else if (wind > 15) score -= 15;
  // Precip
  if (precip > 0.1) score -= 30;
  else if (precip > 0) score -= 15;
  // Thunderstorm / heavy snow
  if (code >= 80) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function scoreLabel(s) {
  if (s >= 80) return { text: "Perfect day to run", color: "#39FF14" };
  if (s >= 60) return { text: "Good enough — go for it", color: "#FFD166" };
  if (s >= 40) return { text: "Dress for it", color: "#FF9A3C" };
  return             { text: "Maybe the treadmill today", color: "#FF4D4D" };
}

// ── console.assert checks ────────────────────────────────────────────────
function runAssertions(data, error) {
  const h1 = document.querySelector("h1");
  console.assert(h1 !== null, "ASSERT 1 FAIL: <h1> heading missing from DOM");

  if (!error && data) {
    const scoreEl = document.querySelector("[data-testid='run-score']");
    console.assert(scoreEl !== null, "ASSERT 2 FAIL: run-score element should exist when data loads");
    const tempEl = document.querySelector("[data-testid='temp-value']");
    console.assert(tempEl !== null && tempEl.textContent.includes("°"),
      "ASSERT 3 FAIL: temperature value should contain '°' when data loads");
  }

  if (error) {
    const errEl = document.querySelector("[data-testid='error-banner']");
    console.assert(errEl !== null, "ASSERT 3 FAIL: error banner should appear when fetch fails");
  }
}
// ────────────────────────────────────────────────────────────────────────

export default function RunDashboard() {
  const [cityIdx, setCityIdx]   = useState(0);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [broken, setBroken]     = useState(false);

  const city = CITIES[cityIdx];

  async function fetchWeather(lat, lng, isBroken) {
    setLoading(true);
    setError(null);
    setData(null);
    const url = isBroken
      ? "https://api.open-meteo.com/v1/BROKEN_404"
      : buildUrl(lat, lng);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      if (!json.current) throw new Error("Unexpected response — no `current` object.");
      setData(json.current);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(city.lat, city.lng, broken);
  }, [cityIdx, broken]);

  useEffect(() => {
    const id = setTimeout(() => runAssertions(data, error), 150);
    return () => clearTimeout(id);
  }, [data, error]);

  const weather = data ? decodeWeather(data.weathercode) : null;
  const score   = data ? runScore(data.temperature_2m, data.wind_speed_10m, data.precipitation, data.weathercode) : null;
  const verdict = score !== null ? scoreLabel(score) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;500;700;900&family=Barlow:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f5f0e8;
          color: #1a1a1a;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }

        .app {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* ── header ── */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
        }
        h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: clamp(52px, 10vw, 88px);
          line-height: 0.88;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        h1 em {
          font-style: normal;
          color: #e63916;
          display: block;
        }
        .meta {
          text-align: right;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #999;
          margin-top: 6px;
        }

        /* ── city tabs ── */
        .city-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 36px;
          border-bottom: 2px solid #d8d0c4;
          padding-bottom: 16px;
        }
        .city-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border: 2px solid transparent;
          border-radius: 3px;
          cursor: pointer;
          background: transparent;
          color: #888;
          transition: all .15s;
        }
        .city-btn:hover { color: #1a1a1a; border-color: #d8d0c4; }
        .city-btn.active {
          background: #1a1a1a;
          color: #f5f0e8;
          border-color: #1a1a1a;
        }

        /* ── action buttons ── */
        .action-row {
          display: flex;
          gap: 8px;
          margin-bottom: 36px;
        }
        .btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 18px;
          border: 2px solid;
          border-radius: 3px;
          cursor: pointer;
          transition: all .15s;
        }
        .btn-break   { color: #e63916; border-color: #e63916; background: transparent; }
        .btn-break:hover { background: #e63916; color: #fff; }
        .btn-restore { color: #1a1a1a; border-color: #1a1a1a; background: transparent; }
        .btn-restore:hover { background: #1a1a1a; color: #f5f0e8; }

        /* ── error banner ── */
        .error-banner {
          border: 2px solid #e63916;
          border-radius: 4px;
          padding: 16px 20px;
          background: #fff5f3;
          color: #c0290f;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        /* ── loading ── */
        .loading-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .skel {
          border-radius: 4px;
          background: linear-gradient(90deg, #e8e2d8 25%, #ddd8ce 50%, #e8e2d8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── main card ── */
        .main-card {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 36px 32px;
          margin-bottom: 20px;
          animation: slideIn .4s ease both;
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }
        .city-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 36px;
          color: #f5f0e8;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .weather-icon {
          font-size: 48px;
          line-height: 1;
        }
        .weather-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #666;
          margin-top: 4px;
        }

        /* ── stats row ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .stat {
          background: #242424;
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #555;
        }
        .stat-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #f5f0e8;
          letter-spacing: -0.01em;
        }
        .stat-unit {
          font-size: 12px;
          color: #555;
          font-weight: 500;
        }

        /* ── run score ── */
        .score-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .score-ring {
          position: relative;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
        }
        .score-ring svg { transform: rotate(-90deg); }
        .score-num {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 22px;
          color: #f5f0e8;
        }
        .verdict-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          line-height: 1.1;
        }
        .verdict-sub {
          font-size: 12px;
          color: #555;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 4px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        /* ── footer ── */
        .footer {
          margin-top: 48px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
          display: flex;
          justify-content: space-between;
        }
      `}</style>

      <div className="app">
        {/* ── Header ── */}
        <div className="topbar">
          <h1>Run<em>Check</em></h1>
          <div className="meta">
            <div>HW10 · API Dashboard</div>
            <div style={{color:"#bbb", marginTop:4}}>Open Meteo · No key</div>
          </div>
        </div>

        {/* ── City selector ── */}
        <div className="city-row">
          {CITIES.map((c, i) => (
            <button
              key={c.name}
              className={`city-btn ${i === cityIdx && !broken ? "active" : ""}`}
              onClick={() => { setBroken(false); setCityIdx(i); }}
            >{c.name}</button>
          ))}
        </div>

        {/* ── Break / Restore ── */}
        <div className="action-row">
          <button className="btn btn-break"   onClick={() => setBroken(true)}>Break API</button>
          <button className="btn btn-restore" onClick={() => { setBroken(false); fetchWeather(city.lat, city.lng, false); }}>Restore</button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner" data-testid="error-banner">
            ⚠ Fetch failed — {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="loading-block">
            <div className="skel" style={{height:200}}/>
            <div className="skel" style={{height:80, width:"60%"}}/>
          </div>
        )}

        {/* ── Data card ── */}
        {!loading && data && (
          <div className="main-card">
            <div className="card-top">
              <div>
                <div className="city-label">{city.name}</div>
                <div className="weather-label">{weather.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="weather-icon">{weather.icon}</div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat">
                <span className="stat-label">Temp</span>
                <span className="stat-value" data-testid="temp-value">
                  {Math.round(data.temperature_2m)}<span className="stat-unit">°F</span>
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Feels like</span>
                <span className="stat-value">
                  {Math.round(data.apparent_temperature)}<span className="stat-unit">°F</span>
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Wind</span>
                <span className="stat-value">
                  {Math.round(data.wind_speed_10m)}<span className="stat-unit"> mph</span>
                </span>
              </div>
            </div>

            {/* ── Run score ── */}
            <div className="score-section" data-testid="run-score">
              <div className="score-ring">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#333" strokeWidth="6"/>
                  <circle
                    cx="36" cy="36" r="28" fill="none"
                    stroke={verdict.color}
                    strokeWidth="6"
                    strokeDasharray={`${(score / 100) * 175.9} 175.9`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="score-num">{score}</div>
              </div>
              <div>
                <div className="verdict-text" style={{color: verdict.color}}>{verdict.text}</div>
                <div className="verdict-sub">Run score out of 100</div>
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          <span>Source: open-meteo.com</span>
          <span>HW10 · Spring 2026</span>
        </div>
      </div>
    </>
  );
}
