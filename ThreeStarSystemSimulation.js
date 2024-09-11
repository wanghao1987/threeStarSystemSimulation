import React, { useState, useEffect, useRef } from "react";

const G = 6.6743e-11;
const SCALE = 1e9;

const initialBodies = [
  {
    name: "Star 1",
    mass: 1.689e30,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    color: "#FFD700",
  },
  {
    name: "Star 2",
    mass: 1.5e30,
    x: 0,
    y: 1.5e11,
    vx: 0,
    vy: 2e4,
    color: "#FFA500",
  },
  {
    name: "Star 3",
    mass: 1.9e30,
    x: -1.1e11,
    y: 0,
    vx: 0,
    vy: -2e4,
    color: "#FF4500",
  },
  {
    name: "Planet",
    mass: 5.972e24,
    x: 1e11,
    y: 0,
    vx: 0,
    vy: 3e4,
    color: "#1E90FF",
  },
];

const ThreeStarSystemSimulation = () => {
  // bodies: The state that holds the current positions, velocities, and other properties of the celestial bodies.
  const [bodies, setBodies] = useState(initialBodies);
  // trajectories: The state that holds the path history of each body, which will be visualized on the canvas as their orbit.
  const [trajectories, setTrajectories] = useState(initialBodies.map(() => []));
  // A reference to the HTML <canvas> element used for drawing the simulation.
  const canvasRef = useRef(null);
// This hook sets up an interval to continuously update the positions of the celestial bodies based on gravitational forces.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBodies((prevBodies) => {
        const newBodies = updatePositions(prevBodies);
        setTrajectories((prevTrajectories) =>
          prevTrajectories.map((traj, i) =>
            [...traj, { x: newBodies[i].x, y: newBodies[i].y }].slice(-1000)
          )
        );
        return newBodies;
      });
    }, 50);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);

    // draw the path of body
    trajectories.forEach((traj, index) => {
      ctx.beginPath();
      ctx.strokeStyle = bodies[index].color;
      ctx.lineWidth = 1;
      traj.forEach((pos, i) => {
        const x = width / 2 + pos.x / SCALE;
        const y = height / 2 - pos.y / SCALE;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // draw the body
    bodies.forEach((body) => {
      ctx.beginPath();
      ctx.fillStyle = body.color;
      ctx.arc(
        width / 2 + body.x / SCALE,
        height / 2 - body.y / SCALE,
        body.name === "Planet" ? 5 : 10,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, [bodies, trajectories]);

// This function is responsible for updating the positions and velocities of the celestial bodies using Newton's law of universal gravitation.
  const updatePositions = (bodies) => {
    const dt = 24 * 3600; // 24h
    return bodies.map((body, i) => {
      let fx = 0,
        fy = 0;
      bodies.forEach((otherBody, j) => {
        if (i !== j) {
          const dx = otherBody.x - body.x;
          const dy = otherBody.y - body.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const f = (G * body.mass * otherBody.mass) / (r * r);
          fx += (f * dx) / r;
          fy += (f * dy) / r;
        }
      });

      const ax = fx / body.mass;
      const ay = fy / body.mass;

      return {
        ...body,
        vx: body.vx + ax * dt,
        vy: body.vy + ay * dt,
        x: body.x + body.vx * dt,
        y: body.y + body.vy * dt,
      };
    });
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-700"
      />
    </div>
  );
};

export default ThreeStarSystemSimulation;
