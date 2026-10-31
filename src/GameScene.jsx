import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { addAmbient, box, buildRestaurant, cylinder, makeCar, makeCharacter, sphere } from './Scene.jsx';

function buildCityWalker(parent, { side, z, direction, phase, coat, skin, hair }) {
  const group = new THREE.Group();
  group.name = 'city-pedestrian';
  group.position.set(side * 6.25, 0, z);
  group.rotation.y = direction > 0 ? 0 : Math.PI;
  parent.add(group);
  const material = (color, roughness = 0.84) => new THREE.MeshStandardMaterial({ color, roughness });
  const coatMaterial = material(coat);
  const skinMaterial = material(skin);
  const hairMaterial = material(hair);
  const trouserMaterial = material(0x343236);
  const addPart = (name, geometry, partMaterial, position, parentGroup = group) => {
    const mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    parentGroup.add(mesh);
    return mesh;
  };
  addPart('pedestrian-coat', new THREE.CylinderGeometry(0.13, 0.2, 0.62, 8), coatMaterial, [0, 1.02, 0]);
  addPart('pedestrian-head', new THREE.SphereGeometry(0.17, 10, 8), skinMaterial, [0, 1.52, 0.015]);
  addPart('pedestrian-hair', new THREE.SphereGeometry(0.18, 8, 6), hairMaterial, [0, 1.63, -0.025]).scale.set(1, 0.72, 1);
  const arms = [-1, 1].map((sideSign) => {
    const pivot = new THREE.Group();
    pivot.position.set(sideSign * 0.19, 1.24, 0);
    group.add(pivot);
    addPart('pedestrian-arm', new THREE.CylinderGeometry(0.045, 0.06, 0.48, 6), coatMaterial, [0, -0.23, 0], pivot);
    return pivot;
  });
  const legs = [-1, 1].map((sideSign) => {
    const pivot = new THREE.Group();
    pivot.position.set(sideSign * 0.085, 0.69, 0);
    group.add(pivot);
    addPart('pedestrian-leg', new THREE.CylinderGeometry(0.055, 0.07, 0.48, 6), trouserMaterial, [0, -0.23, 0], pivot);
    addPart('pedestrian-shoe', new THREE.BoxGeometry(0.12, 0.075, 0.2), material(0x211f20), [0, -0.46, 0.06], pivot);
    return pivot;
  });
  return { group, side, startZ: z, direction, phase, pace: 1 + (phase % 3) * 0.08, arms, legs };
}

function buildTrafficSignal(parent, x, z) {
  const signal = new THREE.Group();
  signal.position.set(x, 0, z);
  signal.name = 'city-traffic-signal';
  parent.add(signal);
  cylinder(signal, 'traffic-signal-pole', 0.045, 0.065, 3.25, 0x494344, [0, 1.62, 0]);
  box(signal, 'traffic-signal-housing', [0.27, 0.76, 0.24], 0x242325, [0, 3.06, 0.04], { roughness: 0.4, metalness: 0.16 });
  const lights = [
    { color: 0xf05c52, y: 3.29 },
    { color: 0xf4bd68, y: 3.06 },
    { color: 0x75c88a, y: 2.83 },
  ].map(({ color, y }) => {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 8, 6),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.06, roughness: 0.3 }),
    );
    lamp.position.set(0, y, 0.18);
    lamp.userData.signalColor = color;
    signal.add(lamp);
    return lamp;
  });
  return lights;
}

function buildOpenCity(world) {
  const city = new THREE.Group();
  city.name = 'open-city';
  world.add(city);

  const pavement = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 440),
    new THREE.MeshStandardMaterial({ color: 0x373236, roughness: 0.92 }),
  );
  pavement.rotation.x = -Math.PI / 2;
  pavement.receiveShadow = true;
  city.add(pavement);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 420),
    new THREE.MeshStandardMaterial({ color: 0x1e1d20, roughness: 0.42, metalness: 0.02 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.018;
  road.receiveShadow = true;
  city.add(road);

  for (const side of [-1, 1]) {
    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 420),
      new THREE.MeshStandardMaterial({ color: 0x584345, roughness: 0.86 }),
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(side * 6.35, 0.028, 0);
    sidewalk.receiveShadow = true;
    city.add(sidewalk);
    box(city, 'curb', [0.16, 0.22, 420], 0x79565a, [side * 4.94, 0.13, 0]);
    box(city, 'sidewalk-edge', [0.07, 0.025, 420], 0xc69b82, [side * 7.8, 0.045, 0], { emissive: 0x68483a, emissiveIntensity: 0.18 });
  }

  for (let z = -196; z <= 196; z += 28) {
    box(city, 'center-dash', [0.16, 0.025, 5], 0xe2d2bb, [0, 0.045, z], { emissive: 0x645442, emissiveIntensity: 0.18 });
    for (const side of [-1, 1]) box(city, 'lane-dash', [0.055, 0.02, 2.8], 0x806270, [side * 3.05, 0.04, z + 5]);
  }

  for (const crossZ of [-84, 0, 84]) {
    const crossStreet = new THREE.Mesh(
      new THREE.PlaneGeometry(116, 8),
      new THREE.MeshStandardMaterial({ color: 0x242326, roughness: 0.42 }),
    );
    crossStreet.rotation.x = -Math.PI / 2;
    crossStreet.position.set(0, 0.022, crossZ);
    city.add(crossStreet);
    for (let stripe = -3; stripe <= 3; stripe += 1) {
      box(city, 'crosswalk', [0.64, 0.027, 3.2], 0xd7c6b0, [stripe * 0.95, 0.05, crossZ], { emissive: 0x514638, emissiveIntensity: 0.18 });
    }
  }

  const bounds = [];
  const buildingColors = [0x302b30, 0x3d3236, 0x473438, 0x2b292e, 0x4a3639];
  for (const side of [-1, 1]) {
    for (let row = -6; row <= 6; row += 1) {
      const z = row * 21 - 2;
      const width = 7 + ((row * row + (side > 0 ? 3 : 1)) % 4);
      const depth = 12 + ((row * 5 + 50) % 6);
      const height = 12 + ((row * row * 3 + (side > 0 ? 5 : 1)) % 19);
      const x = side * (13.4 + ((row + 40) % 3) * 1.5);
      const shade = buildingColors[Math.abs(row + (side > 0 ? 2 : 0)) % buildingColors.length];
      const building = box(city, 'city-building', [width, height, depth], shade, [x, height / 2 - 0.03, z], { roughness: 0.88 });
      building.userData.trackPhase = Math.abs(z) * 0.2;
      bounds.push({ x, z, halfWidth: width / 2, halfDepth: depth / 2 });

      const floors = Math.max(2, Math.floor(height / 5));
      for (let floor = 0; floor < floors; floor += 1) {
        const y = 2 + floor * 3.2;
        for (const windowZ of [-depth * 0.27, depth * 0.27]) {
          const lit = (row + floor + Math.round(windowZ)) % 3 !== 0;
          const hue = lit ? 0xffd9ac : 0x51474a;
          const pane = box(
            building,
            'city-window',
            [0.05, 1.02, 0.82],
            lit ? 0xb49572 : 0x302c30,
            [-side * (width / 2 + 0.035), y - height / 2, windowZ],
            { emissive: hue, emissiveIntensity: lit ? 0.46 : 0.06, roughness: 0.28 },
          );
          pane.material.toneMapped = false;
        }
      }
      box(building, 'neon-band', [0.08, 0.1, depth * 0.84], 0xdba181, [-side * (width / 2 + 0.08), 2.2 - height / 2, 0], {
        emissive: 0x9f6952,
        emissiveIntensity: 0.46,
      });
    }
  }

  for (let z = -140; z <= 140; z += 42) {
    for (const side of [-1, 1]) {
      cylinder(city, 'lamp-post', 0.045, 0.07, 5.4, 0x59484a, [side * 4.45, 2.7, z]);
      const arm = box(city, 'lamp-arm', [0.92, 0.055, 0.07], 0x79615c, [side * 4.84, 5.25, z]);
      arm.rotation.z = side * 0.12;
      sphere(city, 'streetlamp', [0.16, 0.08, 0.15], 0xffe0b4, [side * 5.24, 5.18, z], {
        emissive: 0xffb96f,
        emissiveIntensity: 1.7,
      });
      const glow = new THREE.PointLight(side < 0 ? 0xffc17f : 0xffd5a1, 5.5, 8, 2);
      glow.position.set(side * 5.24, 5.12, z);
      city.add(glow);
    }
  }

  const trafficSignals = [-84, 0, 84].flatMap((crossZ, index) =>
    [-1, 1].map((side) => ({ lights: buildTrafficSignal(city, side * 4.15, crossZ), phase: index * 5 + (side > 0 ? 2.5 : 0) })),
  );
  const pedestrianSpecs = [
    { side: -1, z: -38, direction: 1, phase: 0.2, coat: 0x777c78, skin: 0xc78f74, hair: 0x30251f },
    { side: -1, z: 36, direction: -1, phase: 1.1, coat: 0x98664f, skin: 0xd9a184, hair: 0x3c2930 },
    { side: -1, z: 112, direction: 1, phase: 2.2, coat: 0x61727a, skin: 0xb77b68, hair: 0x241f23 },
    { side: 1, z: -104, direction: -1, phase: 0.7, coat: 0x7c5e70, skin: 0xd8a38a, hair: 0x2c2528 },
    { side: 1, z: -8, direction: 1, phase: 1.7, coat: 0x66795f, skin: 0xc98970, hair: 0x392c24 },
    { side: 1, z: 76, direction: -1, phase: 2.7, coat: 0x76695f, skin: 0xd1a18c, hair: 0x252124 },
  ];
  const pedestrians = pedestrianSpecs.map((spec) => buildCityWalker(city, spec));

  // The restaurant is a clear landmark at the end of the avenue.
  box(city, 'restaurant-exterior', [13, 11, 9], 0x49383a, [15.5, 5.5, 102], { roughness: 0.74 });
  box(city, 'restaurant-window', [0.08, 4.7, 5.2], 0xa77a61, [8.94, 5.4, 102], {
    emissive: 0xffbd78,
    emissiveIntensity: 0.52,
    roughness: 0.19,
  });
  box(city, 'restaurant-sign', [0.12, 1.1, 5.8], 0xf2bd8d, [8.82, 9.2, 102], {
    emissive: 0xd68c5e,
    emissiveIntensity: 0.82,
  });
  for (const z of [99, 101, 103, 105]) box(city, 'restaurant-door-seam', [0.035, 3.6, 0.04], 0xe8c8a6, [8.8, 2.1, z], { emissive: 0x876345, emissiveIntensity: 0.22 });
  const marker = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.055, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0xe8c59b, emissive: 0xbe8a54, emissiveIntensity: 0.9 }),
  );
  marker.name = 'restaurant-marker';
  marker.rotation.x = Math.PI / 2;
  marker.position.set(0, 0.08, 98);
  city.add(marker);
  return { city, bounds, marker, pedestrians, trafficSignals };
}

export default function GameScene({ stage, controlsRef, onPhoneRequest, onEnterCar, onCarArrived, onNearCarChange, onDriveProgress, onRestaurantReached, onEnterRestaurant, onPlayerPosition, onDinnerReady, onDinnerInteract }) {
  const hostRef = useRef(null);
  const stageRef = useRef(stage);
  const callbacksRef = useRef({});
  const controllerRef = useRef(null);
  stageRef.current = stage;
  callbacksRef.current = { onPhoneRequest, onEnterCar, onCarArrived, onNearCarChange, onDriveProgress, onRestaurantReached, onEnterRestaurant, onPlayerPosition, onDinnerReady, onDinnerInteract };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    addAmbient(scene);
    scene.background = new THREE.Color(0x1d1b1c);
    scene.fog = new THREE.FogExp2(0x252124, 0.0045);

    const world = new THREE.Group();
    world.name = 'game-world';
    scene.add(world);
    const { city, bounds, pedestrians, trafficSignals } = buildOpenCity(world);
    const dinner = new THREE.Group();
    dinner.name = 'dinner-interior';
    dinner.visible = false;
    world.add(dinner);
    const restaurantActors = buildRestaurant(dinner);
    const restaurantWalkers = [
      {
        actor: restaurantActors.demeEntry,
        seated: restaurantActors.deme,
        path: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.55, 0, 5.5), new THREE.Vector3(0.6, 0, 4.1),
          new THREE.Vector3(1.25, 0, 3.05), new THREE.Vector3(2.1, 0, 1.85), new THREE.Vector3(2.23, 0, 0.1),
        ]),
        delay: 0,
        duration: 3.35,
        finalYaw: -Math.PI / 2,
      },
      {
        actor: restaurantActors.niniEntry,
        seated: restaurantActors.nini,
        path: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.45, 0, 6.2), new THREE.Vector3(-0.72, 0, 4.7),
          new THREE.Vector3(-1.35, 0, 3.45), new THREE.Vector3(-2.08, 0, 1.8), new THREE.Vector3(-2.23, 0, 0.1),
        ]),
        delay: 0.62,
        duration: 3.55,
        finalYaw: Math.PI / 2,
      },
    ].map((walker) => ({
      ...walker,
      legs: walker.actor.children.filter((part) => part.name.includes('-leg')),
      arms: walker.actor.children.filter((part) => part.name.includes('-arm')),
    }));
    const pickupCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, -2.515),
      new THREE.Vector3(-0.12, 0, -1.5),
      new THREE.Vector3(-3.05, 0, -0.15),
      new THREE.Vector3(-3.05, 0, 1.2),
    );
    const departureCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-3.05, 0, 1.2),
      new THREE.Vector3(-3.05, 0, 2.15),
      new THREE.Vector3(0, 0, 2.25),
      new THREE.Vector3(0, 0, 3.2),
    );

    const player = makeCharacter(world, { name: 'nini-player', x: -5.85, z: 4.3, dress: 0x795762, girl: true });
    player.rotation.y = 0.43;
    player.userData.baseY = 0;
    const playerLegs = player.children.filter((part) => part.name.includes('-leg'));
    const playerArms = player.children.filter((part) => part.name.includes('-arm'));
    const playerRim = new THREE.PointLight(0xffbd8e, 10, 7, 2);
    playerRim.position.set(0, 2.35, 0.15);
    player.add(playerRim);

    const car = makeCar(world, 0, -42, 0x25434b);
    car.visible = false;
    car.rotation.y = Math.PI / 2;
    const trafficCars = [
      { lane: -2.15, startZ: 22, direction: 1, speed: 7.4, paint: 0xa9ada7 },
      { lane: 2.15, startZ: 58, direction: -1, speed: 8.6, paint: 0x74453b },
    ].map((traffic) => {
      const vehicle = makeCar(world, traffic.lane, traffic.startZ, traffic.paint);
      vehicle.name = 'city-traffic-car';
      vehicle.rotation.y = traffic.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      vehicle.scale.setScalar(0.84);
      const wheels = [];
      vehicle.traverse((part) => { if (part.name === 'wheel') wheels.push(part); });
      return { ...traffic, vehicle, wheels };
    });
    const driver = makeCharacter(car.userData.body, { name: 'deme-driver', x: 0.28, z: -0.31, dress: 0x536078, seated: true });
    driver.rotation.y = -Math.PI / 2;
    driver.scale.setScalar(0.61);
    driver.position.y = 0.38;
    const passenger = makeCharacter(car.userData.body, { name: 'nini-passenger', x: 0.32, z: 0.38, dress: 0x9b435f, girl: true, seated: true });
    passenger.rotation.y = -Math.PI / 2;
    passenger.scale.setScalar(0.61);
    passenger.position.y = 0.38;
    passenger.visible = false;

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
    camera.position.set(player.position.x - 2.2, 3.2, player.position.z + 7.8);
    camera.lookAt(player.position.x + 0.8, 1.3, player.position.z - 2.5);

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const portrait = height > width;
      camera.fov = stageRef.current === 'restaurant' ? (portrait ? 56 : 48) : (portrait ? 64 : 58);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const keys = new Set();
    let carMode = 'hidden';
    let carVelocity = 0;
    let driveLane = 0;
    let trafficClock = 0;
    let restaurantElapsed = 0;
    let carArrived = false;
    let nearCar = false;
    let carModeElapsed = 0;
    let arrivalSent = false;
    let restaurantSent = false;
    let restaurantReadySent = false;
    let lastStage = 'opening';
    let lastDriveSecond = -1;
    let positionTimer = 0;
    let cameraYaw = 0.414;
    let pointerDown = false;
    let lastPointerX = 0;
    let active = true;
    const lookTarget = new THREE.Vector3();
    const desiredCamera = new THREE.Vector3();
    const animatedObjects = [];
    const carWheels = [];
    car.traverse((part) => { if (part.name === 'wheel') carWheels.push(part); });
    const spinWheels = (wheels, distance) => {
      // The car's local forward axis is -X, so forward travel rolls the wheel around -Z.
      wheels.forEach((wheel) => { wheel.userData.spin.rotation.z -= distance / 0.355; });
    };
    const steerWheels = (wheels, angle) => {
      wheels.forEach((wheel) => { if (wheel.userData.front) wheel.rotation.y = angle; });
    };
    const curveYaw = (curve, t) => {
      const tangent = curve.getTangent(THREE.MathUtils.clamp(t, 0, 1));
      return Math.atan2(tangent.z, -tangent.x);
    };
    const curveSteer = (curve, t) => {
      const yaw = curveYaw(curve, t);
      const nextYaw = curveYaw(curve, Math.min(1, t + 0.025));
      const delta = Math.atan2(Math.sin(nextYaw - yaw), Math.cos(nextYaw - yaw));
      return THREE.MathUtils.clamp(delta * 4.5, -0.42, 0.42);
    };
    scene.traverse((object) => {
      if (object.name === 'restaurant-marker' || object.name === 'candle') animatedObjects.push(object);
    });

    const validMovement = (x, z) => {
      if (x < -11.5 || x > 11.5 || z < -190 || z > 190) return false;
      return !bounds.some((building) => Math.abs(x - building.x) < building.halfWidth + 0.55 && Math.abs(z - building.z) < building.halfDepth + 0.55);
    };

    const setStage = (next) => {
      if (next === lastStage) return;
      const previousStage = lastStage;
      lastStage = next;
      if (next === 'pickup') {
        trafficCars.forEach((traffic) => { traffic.vehicle.visible = true; });
        car.visible = true;
        car.position.set(0, 0, -42);
        car.rotation.y = Math.PI / 2;
        carMode = 'arriving';
        carModeElapsed = 0;
        carArrived = false;
        nearCar = false;
        arrivalSent = false;
        callbacksRef.current.onCarArrived?.(false);
        callbacksRef.current.onNearCarChange?.(false);
      }
      if (next === 'drive') {
        trafficCars.forEach((traffic) => { traffic.vehicle.visible = true; });
        player.visible = false;
        passenger.visible = true;
        city.visible = true;
        dinner.visible = false;
        carMode = 'leaving';
        carModeElapsed = 0;
        carVelocity = 0;
        driveLane = 0;
        if (controlsRef) controlsRef.current = { x: 0, z: 0, accelerate: false, brake: false };
        restaurantSent = false;
        lastDriveSecond = -1;
      }
      if (next === 'restaurant') {
        trafficCars.forEach((traffic) => { traffic.vehicle.visible = false; });
        city.visible = false;
        car.visible = false;
        dinner.visible = true;
        restaurantElapsed = 0;
        restaurantReadySent = false;
        callbacksRef.current.onDinnerReady?.(false);
        restaurantWalkers.forEach((walker) => {
          walker.actor.visible = true;
          walker.seated.visible = false;
          walker.actor.position.copy(walker.path.getPoint(0));
        });
        camera.position.set(0.15, 4.9, 11.2);
        camera.fov = camera.aspect < 1.2 ? 56 : 48;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 1.78, 0.1);
      }
      if (next === 'opening') {
        trafficCars.forEach((traffic) => { traffic.vehicle.visible = true; });
        player.visible = true;
        passenger.visible = false;
        city.visible = true;
        dinner.visible = false;
        if (controlsRef) controlsRef.current = { x: 0, z: 0, accelerate: false, brake: false };
        callbacksRef.current.onDinnerReady?.(false);
        if (previousStage === 'restaurant') {
          player.position.set(-5.85, 0, 4.3);
          camera.fov = camera.aspect < 1.2 ? 64 : 58;
          camera.updateProjectionMatrix();
        }
      }
    };
    controllerRef.current = { setStage };

    const isTyping = (target) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (isTyping(event.target)) return;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' '].includes(key)) {
        keys.add(key);
        event.preventDefault();
      }
      if (event.repeat) return;
      if (key === 'f' && stageRef.current === 'opening') callbacksRef.current.onPhoneRequest?.();
      if (key === 'e' && stageRef.current === 'pickup' && carArrived && nearCar) callbacksRef.current.onEnterCar?.();
      if (key === 'e' && stageRef.current === 'drive' && restaurantSent) callbacksRef.current.onEnterRestaurant?.();
      if (key === 'e' && stageRef.current === 'restaurant' && restaurantReadySent) callbacksRef.current.onDinnerInteract?.();
    };
    const onKeyUp = (event) => keys.delete(event.key.toLowerCase());
    const clearKeys = () => keys.clear();
    const onPointerDown = (event) => {
      if ((event.pointerType === 'mouse' && event.button !== 0) || event.pointerType === 'pen') return;
      pointerDown = true;
      lastPointerX = event.clientX;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!pointerDown) return;
      const sensitivity = event.pointerType === 'touch' ? 0.006 : 0.0032;
      cameraYaw -= (event.clientX - lastPointerX) * sensitivity;
      lastPointerX = event.clientX;
    };
    const onPointerUp = () => { pointerDown = false; };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    let raf = 0;
    const targetFrameMs = 1000 / 60;
    let lastFrameTime = performance.now();
    const frame = (now) => {
      if (!active) return;
      raf = requestAnimationFrame(frame);
      if (now - lastFrameTime < targetFrameMs) return;
      const frameDuration = now - lastFrameTime;
      lastFrameTime = now - (frameDuration % targetFrameMs);
      const dt = Math.min(frameDuration / 1000, 0.035);
      const elapsed = now / 1000;
      const currentStage = stageRef.current;
      if (currentStage === 'phone') return;
      if (currentStage !== 'restaurant') {
        trafficClock += dt;
        const trafficLoopLength = 360;
        trafficCars.forEach((traffic) => {
          const wrapped = ((traffic.startZ + traffic.direction * trafficClock * traffic.speed + trafficLoopLength / 2) % trafficLoopLength + trafficLoopLength) % trafficLoopLength;
          traffic.vehicle.position.set(traffic.lane, 0, wrapped - trafficLoopLength / 2);
          traffic.vehicle.userData.body.position.y = 0.005 + Math.sin(trafficClock * 5 + traffic.startZ) * 0.003;
          spinWheels(traffic.wheels, dt * traffic.speed);
        });
      }
      pedestrians.forEach((walker) => {
        const wrapped = ((walker.startZ + walker.direction * elapsed * 0.72 + 220) % 440 + 440) % 440 - 220;
        walker.group.position.set(walker.side * (6.25 + Math.sin(elapsed * 0.55 + walker.phase) * 0.12), 0, wrapped);
        const stride = Math.sin(elapsed * 3.5 * walker.pace + walker.phase) * 0.36;
        walker.legs[0].rotation.x = stride;
        walker.legs[1].rotation.x = -stride;
        walker.arms[0].rotation.x = -stride * 0.56;
        walker.arms[1].rotation.x = stride * 0.56;
      });
      trafficSignals.forEach((signal, index) => {
        const phase = (elapsed + signal.phase) % 18;
        const activeLamp = phase < 7.5 ? 2 : phase < 9 ? 1 : 0;
        signal.lights.forEach((lamp, lampIndex) => {
          lamp.material.emissiveIntensity = lampIndex === activeLamp ? 1.65 : 0.06;
          lamp.material.color.setHex(lampIndex === activeLamp ? lamp.userData.signalColor : 0x3a3535);
        });
      });

      if (currentStage === 'opening' || currentStage === 'pickup') {
        const touch = controlsRef?.current ?? { x: 0, z: 0 };
        let moveX = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + (touch.x || 0);
        let moveZ = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + (touch.z || 0);
        const inputX = moveX;
        const inputZ = moveZ;
        moveX = inputX * Math.cos(cameraYaw) - inputZ * Math.sin(cameraYaw);
        moveZ = inputX * Math.sin(cameraYaw) + inputZ * Math.cos(cameraYaw);
        const magnitude = Math.hypot(moveX, moveZ);
        if (magnitude > 1) {
          moveX /= magnitude;
          moveZ /= magnitude;
        }
        const sprint = keys.has('shift');
        const speed = sprint ? 5.4 : 3.15;
        const nextX = player.position.x + moveX * speed * dt;
        const nextZ = player.position.z + moveZ * speed * dt;
        if (magnitude > 0.06) {
          if (validMovement(nextX, player.position.z)) player.position.x = nextX;
          if (validMovement(player.position.x, nextZ)) player.position.z = nextZ;
          player.rotation.y = Math.atan2(moveX, moveZ);
          player.position.y = Math.abs(Math.sin(elapsed * 12)) * Math.min(0.08, magnitude * 0.07);
          playerLegs.forEach((part, index) => { part.rotation.x = Math.sin(elapsed * 10 + index * Math.PI) * 0.48 * Math.min(1, magnitude); });
          playerArms.forEach((part, index) => { if (index === 0) part.rotation.x = Math.sin(elapsed * 10 + Math.PI) * 0.18 * Math.min(1, magnitude); });
        } else {
          player.position.y += (player.userData.baseY - player.position.y) * 0.18;
          playerLegs.forEach((part) => { part.rotation.x *= 0.8; });
          playerArms.forEach((part) => { part.rotation.x *= 0.8; });
        }
        positionTimer += dt;
        if (positionTimer >= 0.18) {
          positionTimer = 0;
          callbacksRef.current.onPlayerPosition?.({ x: player.position.x, z: player.position.z });
        }

        if (carMode === 'arriving') {
          carModeElapsed += dt;
          const time = carModeElapsed;
          const previousX = car.position.x;
          const previousZ = car.position.z;
          if (time < 5.3) {
            car.position.x = 0;
            car.position.z = -42 + time * 7.45;
            car.rotation.y = Math.PI / 2;
            steerWheels(carWheels, 0);
          } else {
            const t = THREE.MathUtils.clamp((time - 5.3) / 1.75, 0, 1);
            const ease = t * t * (3 - 2 * t);
            const point = pickupCurve.getPoint(ease);
            car.position.x = point.x;
            car.position.z = point.z;
            car.rotation.y = curveYaw(pickupCurve, ease);
            steerWheels(carWheels, curveSteer(pickupCurve, ease));
          }
          const speedScale = time < 5.3 ? 1 : Math.max(0.13, 1 - (time - 5.3) / 1.75);
          car.userData.body.position.y = 0.004 + Math.sin(time * 6) * 0.004 * speedScale;
          spinWheels(carWheels, Math.hypot(car.position.x - previousX, car.position.z - previousZ));
          if (time >= 7.05) {
            carMode = 'parked';
            car.position.set(-3.05, 0, 1.2);
            car.rotation.y = Math.PI / 2;
            car.userData.body.position.y = 0;
            car.userData.body.rotation.z = 0;
            steerWheels(carWheels, 0);
            carArrived = true;
            if (!arrivalSent) {
              arrivalSent = true;
              callbacksRef.current.onCarArrived?.(true);
            }
          }
        }

        if (currentStage === 'pickup' && carMode === 'parked') {
          const close = Math.hypot(player.position.x - car.position.x, player.position.z - car.position.z) < 2.9;
          if (close !== nearCar) {
            nearCar = close;
            callbacksRef.current.onNearCarChange?.(close);
          }
        }
      }

      if (currentStage === 'drive') {
        carModeElapsed += dt;
        if (carModeElapsed < 2.1) {
          const t = THREE.MathUtils.clamp(carModeElapsed / 2.1, 0, 1);
          const ease = t * t * (3 - 2 * t);
          const previousX = car.position.x;
          const previousZ = car.position.z;
          const point = departureCurve.getPoint(ease);
          car.position.x = point.x;
          car.position.z = point.z;
          car.rotation.y = curveYaw(departureCurve, ease);
          steerWheels(carWheels, curveSteer(departureCurve, ease));
          car.userData.body.position.y = 0.004 + Math.sin(carModeElapsed * 6) * 0.004;
          spinWheels(carWheels, Math.hypot(car.position.x - previousX, car.position.z - previousZ));
        } else if (!restaurantSent) {
          const rideTime = carModeElapsed - 2.1;
          const driveControls = controlsRef?.current ?? {};
          const steerInput = THREE.MathUtils.clamp(
            (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + (driveControls.x || 0),
            -1,
            1,
          );
          driveLane = THREE.MathUtils.clamp(driveLane + steerInput * 1.15 * dt, -1.1, 1.1);
          car.position.x += (driveLane - car.position.x) * (1 - Math.exp(-4.2 * dt));
          const wheelSteer = steerInput * 0.22;
          car.rotation.y = Math.PI / 2 + wheelSteer * 0.28;
          steerWheels(carWheels, wheelSteer);
          const previousZ = car.position.z;
          const previousVelocity = carVelocity;
          const remaining = Math.max(0, 98 - car.position.z);
          const throttle = keys.has('w') || keys.has('arrowup') || driveControls.accelerate ? 1 : 0.82;
          const accelerationSpeed = Math.min(13.6 * throttle, rideTime * 15.5);
          const brakingSpeed = Math.sqrt(2 * 4.4 * remaining);
          const handBrake = keys.has('s') || keys.has('arrowdown') || driveControls.brake;
          const targetSpeed = Math.min(accelerationSpeed, brakingSpeed, handBrake ? 2.2 : Infinity);
          carVelocity += (targetSpeed - carVelocity) * (1 - Math.exp(-3.4 * dt));
          car.position.z = Math.min(98, car.position.z + carVelocity * dt);
          car.userData.body.position.y = 0.006 + Math.sin(carModeElapsed * 6.2) * 0.008;
          const acceleration = (carVelocity - previousVelocity) / Math.max(dt, 0.001);
          car.userData.body.rotation.z = THREE.MathUtils.clamp(-acceleration * 0.003, -0.035, 0.035);
          const elapsedSecond = Math.floor(rideTime);
          if (elapsedSecond !== lastDriveSecond) {
            lastDriveSecond = elapsedSecond;
            callbacksRef.current.onDriveProgress?.(Math.min(1, car.position.z / 98));
          }
          spinWheels(carWheels, car.position.z - previousZ);
          if (car.position.z >= 98) {
            carVelocity = 0;
            car.userData.body.position.y = 0;
            car.userData.body.rotation.z = 0;
            restaurantSent = true;
            carMode = 'arrived-at-restaurant';
            callbacksRef.current.onRestaurantReached?.(true);
          }
        }
      }

      if (currentStage === 'restaurant') {
        restaurantElapsed += dt;
        let seatedCount = 0;
        restaurantWalkers.forEach((walker) => {
          const rawProgress = (restaurantElapsed - walker.delay) / walker.duration;
          const progress = THREE.MathUtils.clamp(rawProgress, 0, 1);
          if (progress >= 1) {
            walker.actor.position.copy(walker.path.getPoint(1));
            walker.legs.forEach((leg) => { leg.rotation.x *= 0.72; });
            seatedCount += 1;
            return;
          }
          const point = walker.path.getPoint(progress);
          const tangent = walker.path.getTangent(Math.min(0.995, progress + 0.012));
          walker.actor.position.set(point.x, Math.abs(Math.sin(elapsed * 8.5)) * 0.035 * Math.sin(Math.PI * progress), point.z);
          const walkingYaw = Math.atan2(tangent.x, tangent.z);
          const turn = THREE.MathUtils.clamp((progress - 0.72) / 0.28, 0, 1);
          const easedTurn = turn * turn * (3 - 2 * turn);
          const yawDelta = Math.atan2(Math.sin(walker.finalYaw - walkingYaw), Math.cos(walker.finalYaw - walkingYaw));
          walker.actor.rotation.y = walkingYaw + yawDelta * easedTurn;
          const stride = Math.sin(restaurantElapsed * 8.5 + progress * 2) * 0.42 * Math.sin(Math.PI * progress);
          walker.legs.forEach((leg, index) => { leg.rotation.x = index === 0 ? stride : -stride; });
          walker.arms.forEach((arm, index) => { arm.rotation.x = (index === 0 ? -stride : stride) * 0.16; });
        });
        if (seatedCount === restaurantWalkers.length) {
          restaurantWalkers.forEach((walker) => {
            walker.actor.visible = false;
            walker.seated.visible = true;
          });
          if (!restaurantReadySent) {
            restaurantReadySent = true;
            callbacksRef.current.onDinnerReady?.(true);
          }
        }
      }

      if (currentStage === 'opening' || currentStage === 'phone' || currentStage === 'pickup') {
        const sinYaw = Math.sin(cameraYaw);
        const cosYaw = Math.cos(cameraYaw);
        const distance = 7.8;
        const shoulder = 0.72;
        desiredCamera.set(
          player.position.x - sinYaw * distance + cosYaw * shoulder,
          player.position.y + 3.15,
          player.position.z + cosYaw * distance + sinYaw * shoulder,
        );
        lookTarget.set(
          player.position.x + sinYaw * 2.8,
          1.3,
          player.position.z - cosYaw * 2.8,
        );
      } else if (currentStage === 'drive') {
        desiredCamera.set(car.position.x + 3.0, car.position.y + 3.2, car.position.z - 7.8);
        lookTarget.set(car.position.x, 1.15, car.position.z + 7.4);
      } else {
        desiredCamera.set(0.15, 4.55, 9.8);
        lookTarget.set(0, 1.78, 0.1);
      }
      const follow = 1 - Math.pow(0.001, dt);
      camera.position.lerp(desiredCamera, follow);
      camera.lookAt(lookTarget);
      animatedObjects.forEach((object) => {
        if (object.name === 'restaurant-marker') object.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.08);
        if (object.name === 'candle') object.scale.y = 0.86 + Math.sin(elapsed * 7 + object.position.x * 3) * 0.08;
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      controllerRef.current = null;
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
        else object.material?.dispose?.();
      });
    };
  }, [controlsRef]);

  useEffect(() => {
    controllerRef.current?.setStage(stage);
  }, [stage]);

  return <div className="three-scene game-canvas" ref={hostRef} aria-label="ღია 3D ქალაქი" />;
}
