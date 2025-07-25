import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import { FaCar } from "react-icons/fa";

// === AI Prediction Hook ===
const useAIPredictedBatteryHealth = (cycles, temperature) => {
  const [predictedHealth, setPredictedHealth] = useState(100);
  const [futureEstimate, setFutureEstimate] = useState("Calculating...");

  useEffect(() => {
    const baseDegradation = 0.001 * cycles + 0.04 * (temperature - 25);
    const currentEfficiency = Math.max(100 - baseDegradation, 60).toFixed(2);
    const projectedDrop = 0.23;
    const days = 30;
    const projectedHealth = Math.max(
      currentEfficiency - days * projectedDrop,
      60
    ).toFixed(1);

    setPredictedHealth(currentEfficiency);
    setFutureEstimate(
      `At your usage, your battery will reach ${projectedHealth}% in 30 days`
    );
  }, [cycles, temperature]);

  return { predictedHealth, futureEstimate };
};

// === Dashboard Hook ===
const useEVDashboard = () => {
  const savedTrip = localStorage.getItem("tripInProgress") === "true";
  const [showPrompt, setShowPrompt] = useState(savedTrip);
  const [continueTrip, setContinueTrip] = useState(savedTrip);

  const [state, setState] = useState({
    speed: 0,
    maxSpeed: 120,
    avgSpeed: 65,
    battery: 76.0,
    voltage: 48.2,
    temp: 32,
    amps: 10.5,
    efficiency: 940,
    distance: savedTrip ? 98.1 : 0,
    started: savedTrip ? "1:22 PM" : "-",
    duration: savedTrip ? "1h 23m" : "-",
    eta: savedTrip ? "2:45 PM" : "-",
    totalDistance: 15420,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    cycles: 112,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        cycles: prev.cycles + 1,
        speed: Math.floor(Math.random() * 80),
        battery: Math.min(
          Math.max(prev.battery + (Math.random() > 0.5 ? 0.2 : -0.2), 0),
          100
        ),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    setContinueTrip(true);
    setShowPrompt(false);
    localStorage.setItem("tripInProgress", "true");
  };

  const handleNewTrip = () => {
    setContinueTrip(false);
    setShowPrompt(false);
    localStorage.setItem("tripInProgress", "false");
    setState((prev) => ({
      ...prev,
      distance: 0,
      started: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: "-",
      eta: "-",
    }));
  };

  return { state, showPrompt, handleContinue, handleNewTrip };
};

// === UI Components ===
const SpeedCircle = ({ value }) => (
  <div style={{ width: 130, height: 130 }}>
    <CircularProgressbar
      value={value}
      maxValue={200}
      text={`${value} km/h`}
      styles={buildStyles({
        pathColor: "#4ade80",
        textColor: "#fff",
        trailColor: "#334155",
        textSize: "16px",
      })}
    />
  </div>
);

const BatteryBar = ({ value }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
      Battery
    </span>
    <div style={{ background: "#334155", borderRadius: 6, height: 14 }}>
      <div
        style={{
          width: `${value}%`,
          background: "#22c55e",
          height: "100%",
          borderRadius: 6,
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
      {value.toFixed(1)}%
    </span>
  </div>
);

const RowItem = ({ label, value, color }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      padding: "8px 12px",
      color: color || "#fff",
    }}
  >
    <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>
      {label}
    </span>
    <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
  </div>
);

const WaterGraph = ({ data }) => {
  const xData = data.map((point) => point.x);
  const yData = data.map((point) => point.y);

  return (
    <div style={{ width: "100%", height: 200 }}>
      <Plot
        data={[
          {
            x: xData,
            y: yData,
            type: "scatter",
            mode: "none",
            fill: "tozeroy",
            fillcolor: "rgba(59,130,246,0.7)",
            name: "Water Level",
            line: { shape: "spline", color: "#3b82f6" },
          },
        ]}
        layout={{
          title: "Distilled Water Level",
          margin: { l: 40, r: 20, b: 30, t: 30 },
          xaxis: { title: "Time", color: "#fff" },
          yaxis: { title: "Liters", range: [2.5, 6.5], color: "#fff" },
          paper_bgcolor: "#1e293b",
          plot_bgcolor: "#1e293b",
          font: { color: "#fff" },
        }}
        config={{ displayModeBar: false }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

const MovingCar = ({ position }) => (
  <div
    style={{
      marginTop: 40,
      background: "#334155",
      borderRadius: 10,
      height: 80,
      position: "relative",
      overflow: "hidden",
      border: "2px solid #475569",
    }}
  >
    <motion.div
      animate={{ x: `${position}%` }}
      transition={{ duration: 1, ease: "linear" }}
      style={{
        position: "absolute",
        top: 20,
        left: 0,
        fontSize: 32,
        color: "#facc15",
      }}
    >
      <FaCar />
    </motion.div>
    <div
      style={{
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        height: 8,
        background: "#0f172a",
      }}
    />
  </div>
);

// === Main App ===
const App = () => {
  const { state, showPrompt, handleContinue, handleNewTrip } = useEVDashboard();
  const { predictedHealth, futureEstimate } = useAIPredictedBatteryHealth(
    state.cycles,
    state.temp
  );
  const [carPos, setCarPos] = useState(0);
  const [waterData, setWaterData] = useState([{ x: 0, y: 6.0 }]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarPos((prev) => (prev >= 90 ? 0 : prev + 5));

      setWaterData((prev) => {
        const last = prev[prev.length - 1];
        const newY = Math.max(2.5, last.y - 0.03);
        return [...prev.slice(-19), { x: prev.length, y: newY }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [waterData]);

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        background: "#0f172a",
        color: "#fff",
        padding: 30,
        minHeight: "100vh",
      }}
    >
      {showPrompt && (
        <div
          style={{
            background: "#1e293b",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 10 }}>Continue previous trip?</div>
          <button
            onClick={handleContinue}
            style={{
              marginRight: 10,
              padding: 6,
              background: "#4ade80",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={handleNewTrip}
            style={{
              padding: 6,
              background: "#ef4444",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ color: "#22c55e", fontWeight: "bold" }}>
          <span
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#22c55e",
              display: "inline-block",
              borderRadius: "50%",
              marginRight: 6,
            }}
          ></span>
          System Online
        </div>
        <div style={{ color: "#60a5fa" }}>
          {state.time} • Cycles: {state.cycles}/1000
        </div>
      </div>

      <div
        style={{
          background: "#1e293b",
          borderRadius: 16,
          padding: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        <SpeedCircle value={state.speed} />
        <BatteryBar value={state.battery} />
        <WaterGraph data={waterData} />
        <RowItem label="Max Speed" value={`${state.maxSpeed} km/h`} />
        <RowItem label="Avg Speed" value={`${state.avgSpeed} km/h`} />
        <RowItem label="Voltage" value={`${state.voltage} V`} color="#facc15" />
        <RowItem label="Temperature" value={`${state.temp}°C`} color="#f87171" />
        <RowItem label="Current" value={`${state.amps} Amps`} color="#3b82f6" />
        <RowItem label="Efficiency" value={`${state.efficiency} Wh`} />
        <RowItem label="Trip Distance" value={`${state.distance} km`} />
        <RowItem label="Trip Start" value={state.started} />
        <RowItem label="Duration" value={state.duration} />
        <RowItem label="ETA" value={state.eta} />
        <RowItem label="Total Distance" value={`${state.totalDistance} km`} />
        <RowItem
          label="AI Predicted Health"
          value={`${predictedHealth}%`}
          color="#facc15"
        />
        <RowItem label="AI Prediction" value={futureEstimate} color="#f97316" />
      </div>

      <MovingCar position={carPos} />
    </div>
  );
};

export default App;
