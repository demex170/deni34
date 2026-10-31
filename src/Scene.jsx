import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const palette = {
  night: 0x1d1b1c,
  ink: 0x30292a,
  gold: 0xf5d2a5,
  rose: 0xd99378,
  skin: 0xd9a88e,
  skin2: 0xb87867,
  hair: 0x241b25,
};

export function box(parent, name, size, color, position, material = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...material }),
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function sphere(parent, name, size, color, position, material = {}) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72, ...material }),
  );
  mesh.name = name;
  mesh.scale.set(...size);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cylinder(parent, name, radiusTop, radiusBottom, height, color, position, material = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24),
    new THREE.MeshStandardMaterial({ color, roughness: 0.66, ...material }),
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function makeCharacter(parent, { name, x, z, dress, seated = false, girl = false, phone = girl && !seated }) {
  const group = new THREE.Group();
  group.name = name;
  group.position.set(x, 0, z);
  parent.add(group);

  const hipY = seated ? 0.9 : 1.02;
  const headY = seated ? 1.82 : 2.02;
  if (girl) {
    const skirt = cylinder(group, `${name}-coat`, 0.22, 0.48, seated ? 0.8 : 1.3, dress, [0, seated ? 0.82 : 0.81, 0]);
    skirt.rotation.z = seated ? -0.12 : 0;
  } else {
    cylinder(group, `${name}-coat`, 0.28, 0.37, seated ? 0.72 : 0.92, dress, [0, hipY, 0]);
  }
  sphere(group, `${name}-neck`, [0.11, 0.15, 0.12], palette.skin, [0, headY - 0.27, 0]);
  sphere(group, `${name}-head`, [0.34, 0.42, 0.31], palette.skin, [0, headY, 0]);
  sphere(group, `${name}-hair`, [0.36, girl ? 0.34 : 0.29, 0.33], palette.hair, [0, headY + 0.18, -0.045]);
  if (girl) {
    sphere(group, `${name}-hair-back`, [0.35, 0.57, 0.15], palette.hair, [0, headY - 0.2, -0.23]);
    sphere(group, `${name}-fringe`, [0.27, 0.13, 0.18], palette.hair, [0, headY + 0.09, 0.23]);
  }
  // Small warm face details read clearly at the scale of the scene.
  for (const eyeX of [-0.105, 0.105]) {
    sphere(group, `${name}-eye`, [0.026, 0.032, 0.019], 0x32252a, [eyeX, headY + 0.005, 0.284]);
    const brow = box(group, `${name}-brow`, [0.082, 0.016, 0.018], palette.hair, [eyeX, headY + 0.092, 0.277]);
    brow.rotation.z = eyeX < 0 ? -0.12 : 0.12;
  }
  sphere(group, `${name}-nose`, [0.035, 0.05, 0.04], palette.skin2, [0, headY - 0.065, 0.305]);
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.075, headY - 0.17, 0.276),
    new THREE.Vector3(-0.035, headY - 0.19, 0.295),
    new THREE.Vector3(0.035, headY - 0.19, 0.295),
    new THREE.Vector3(0.075, headY - 0.17, 0.276),
  ]);
  const smile = new THREE.Mesh(
    new THREE.TubeGeometry(smileCurve, 12, 0.012, 7, false),
    new THREE.MeshStandardMaterial({ color: girl ? 0x974e64 : 0x794853, roughness: 0.7 }),
  );
  smile.name = `${name}-smile`;
  group.add(smile);
  if (girl) {
    for (const earX of [-0.33, 0.33]) {
      sphere(group, `${name}-ear`, [0.066, 0.09, 0.055], palette.skin, [earX, headY - 0.035, 0]);
      sphere(group, `${name}-earring`, [0.025, 0.025, 0.024], 0xffb7c6, [earX, headY - 0.13, 0.045], {
        emissive: 0x8a263e, emissiveIntensity: 0.35,
      });
    }
  }

  const armY = seated ? 1.15 : 1.1;
  for (const side of [-1, 1]) {
    const holdingPhone = phone && side === 1;
    const arm = cylinder(
      group,
      `${name}-arm`,
      0.085,
      0.1,
      seated ? 0.7 : 0.76,
      dress,
      holdingPhone ? [0.39, 1.27, 0.08] : [side * 0.35, armY, 0],
    );
    arm.rotation.z = holdingPhone ? -0.65 : side * -0.22;
    sphere(
      group,
      `${name}-hand`,
      [0.095, 0.12, 0.085],
      palette.skin,
      holdingPhone ? [0.61, 1.58, 0.19] : [side * 0.41, armY - 0.35, seated ? 0.1 : 0],
    );
    if (!seated) {
      const leg = cylinder(group, `${name}-leg`, 0.11, 0.1, 0.85, 0x222637, [side * 0.14, 0.43, 0]);
      if (girl) leg.material.color.setHex(0x292332);
      const shoe = sphere(group, `${name}-shoe`, [0.13, 0.09, 0.23], 0x17111a, [side * 0.14, 0.065, 0.09]);
      shoe.rotation.y = side * 0.08;
    }
  }
  if (girl) {
    const belt = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.035, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0xd895a8, metalness: 0.32, roughness: 0.36 }),
    );
    belt.name = `${name}-belt`;
    belt.rotation.x = Math.PI / 2;
    belt.position.set(0, seated ? 0.9 : 0.77, 0);
    group.add(belt);
    sphere(group, `${name}-belt-jewel`, [0.067, 0.058, 0.035], 0xffc4d0, [0, seated ? 0.9 : 0.77, 0.345], {
      emissive: 0xa14364, emissiveIntensity: 0.4,
    });
  }
  if (phone) {
    const phone = new THREE.Group();
    phone.name = `${name}-held-phone`;
    phone.position.set(0.7, 1.65, 0.2);
    phone.rotation.z = -0.08;
    group.add(phone);
    box(phone, 'phone-case', [0.23, 0.4, 0.075], 0x1c1019, [0, 0, 0], { metalness: 0.5, roughness: 0.24 });
    box(phone, 'phone-glow', [0.195, 0.35, 0.012], 0xf4a1b6, [0, 0, 0.041], {
      emissive: 0xff688d,
      emissiveIntensity: 1.9,
      roughness: 0.24,
    });
    box(phone, 'phone-speaker', [0.045, 0.008, 0.006], 0x411b2b, [0, 0.168, 0.049]);
    sphere(phone, 'phone-camera', [0.009, 0.009, 0.006], 0x22121c, [0.075, 0.169, 0.049]);
  }
  return group;
}

export function makeCar(parent, x, z = 0, paint = 0x263746) {
  const car = new THREE.Group();
  car.name = 'deme-car';
  car.position.set(x, 0, z);
  parent.add(car);
  const body = new THREE.Group();
  body.name = 'car-body-rig';
  car.userData.body = body;
  car.add(body);
  const shellShape = new THREE.Shape();
  shellShape.moveTo(-1.48, 0.42);
  shellShape.lineTo(-1.42, 0.76);
  shellShape.lineTo(-1.13, 0.91);
  shellShape.lineTo(1.12, 0.91);
  shellShape.lineTo(1.43, 0.76);
  shellShape.lineTo(1.48, 0.43);
  shellShape.lineTo(1.32, 0.34);
  shellShape.lineTo(-1.32, 0.34);
  shellShape.closePath();
  const shellGeometry = new THREE.ExtrudeGeometry(shellShape, {
    depth: 1.33,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 3,
  });
  shellGeometry.translate(0, 0, -0.665);
  const paintColor = new THREE.Color(paint);
  const shell = new THREE.Mesh(shellGeometry, new THREE.MeshStandardMaterial({ color: paintColor, metalness: 0.34, roughness: 0.26 }));
  shell.name = 'body';
  shell.castShadow = true;
  shell.receiveShadow = true;
  body.add(shell);

  const trim = 0x9eaaad;
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8fa8b1,
    emissive: 0x17272d,
    emissiveIntensity: 0.18,
    metalness: 0.28,
    roughness: 0.14,
    transparent: true,
    opacity: 0.46,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const addSideWindow = (name, side, points) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([px, py]) => shape.lineTo(px, py));
    shape.closePath();
    const pane = new THREE.Mesh(new THREE.ShapeGeometry(shape), glassMaterial);
    pane.name = name;
    pane.position.z = side * 0.603;
    body.add(pane);
  };
  for (const side of [-1, 1]) {
    addSideWindow('front-side-window', side, [[-0.58, 0.99], [0.22, 0.99], [0.15, 1.37], [-0.28, 1.37]]);
    addSideWindow('rear-side-window', side, [[0.3, 0.99], [0.9, 0.99], [0.49, 1.37], [0.24, 1.37]]);
  }

  box(body, 'bonnet', [0.78, 0.105, 1.18], paintColor.clone().offsetHSL(0, -0.04, 0.055), [-1.02, 0.91, 0], { metalness: 0.38, roughness: 0.24 });
  box(body, 'trunk-lid', [0.62, 0.075, 1.12], paintColor.clone().offsetHSL(0, -0.04, 0.025), [1.05, 0.91, 0], { metalness: 0.34, roughness: 0.25 });
  box(body, 'roof', [0.96, 0.12, 1.1], paintColor.clone().offsetHSL(0, -0.05, -0.055), [-0.03, 1.47, 0], { metalness: 0.3, roughness: 0.24 });
  const frontGlass = box(body, 'front-windshield', [0.075, 0.45, 1.08], 0x87a0aa, [-0.59, 1.19, 0], {
    transparent: true, opacity: 0.5, metalness: 0.32, roughness: 0.12, side: THREE.DoubleSide,
  });
  frontGlass.rotation.z = -0.48;
  const rearGlass = box(body, 'rear-windshield', [0.07, 0.4, 1.04], 0x87a0aa, [0.59, 1.18, 0], {
    transparent: true, opacity: 0.44, metalness: 0.3, roughness: 0.13, side: THREE.DoubleSide,
  });
  rearGlass.rotation.z = 0.48;

  for (const side of [-1, 1]) {
    for (const [pillarX, lean] of [[-0.55, -0.48], [0.02, 0], [0.5, 0.42]]) {
      const pillar = box(body, 'window-pillar', [0.065, 0.48, 0.065], 0x25323b, [pillarX, 1.2, side * 0.62], { metalness: 0.22, roughness: 0.28 });
      pillar.rotation.z = lean;
    }
    box(body, 'window-trim', [1.12, 0.025, 0.024], trim, [-0.02, 0.99, side * 0.637], { metalness: 0.74, roughness: 0.24 });
    box(body, 'door-seam', [0.014, 0.47, 0.012], 0x15232b, [0.34, 0.72, side * 0.684], { roughness: 0.34 });
    box(body, 'door-handle', [0.19, 0.035, 0.025], 0xc3c3b9, [0.17, 0.84, side * 0.696], { metalness: 0.82, roughness: 0.2 });
    box(body, 'side-mirror-arm', [0.13, 0.045, 0.09], 0x263640, [-0.59, 1.06, side * 0.7]);
    box(body, 'side-mirror', [0.18, 0.12, 0.12], 0x344a55, [-0.62, 1.09, side * 0.76], { metalness: 0.42, roughness: 0.2 });

    for (const wheelX of [-0.91, 0.91]) {
      const wheel = new THREE.Group();
      wheel.name = 'wheel';
      wheel.position.set(wheelX, 0.42, side * 0.69);
      wheel.userData.front = wheelX < 0;
      const spin = new THREE.Group();
      spin.name = 'wheel-spin';
      wheel.userData.spin = spin;
      wheel.add(spin);
      car.add(wheel);
      const addWheelCylinder = (name, radius, width, zOffset, color, material = {}) => {
        const geometry = new THREE.CylinderGeometry(radius, radius, width, 28, 1);
        geometry.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...material }));
        mesh.name = name;
        mesh.position.z = side * zOffset;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        spin.add(mesh);
        return mesh;
      };
      addWheelCylinder('rubber-tire', 0.355, 0.2, 0, 0x111417, { roughness: 0.78 });
      addWheelCylinder('alloy-rim', 0.245, 0.06, 0.073, 0xb1b6b4, { metalness: 0.78, roughness: 0.23 });
      addWheelCylinder('wheel-hub', 0.071, 0.055, 0.108, 0xd2c8ad, { metalness: 0.82, roughness: 0.2 });
      const rimRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.19, 0.012, 5, 20),
        new THREE.MeshStandardMaterial({ color: 0xd0d0c7, metalness: 0.82, roughness: 0.22 }),
      );
      rimRing.name = 'wheel-rim-ring';
      rimRing.position.z = side * 0.108;
      spin.add(rimRing);
      for (let spokeIndex = 0; spokeIndex < 5; spokeIndex += 1) {
        const angle = spokeIndex * Math.PI * 2 / 5;
        const spoke = box(spin, 'alloy-spoke', [0.17, 0.023, 0.016], 0xd0d0c7, [Math.cos(angle) * 0.105, Math.sin(angle) * 0.105, side * 0.11], { metalness: 0.84, roughness: 0.2 });
        spoke.rotation.z = angle;
      }
    }
  }

  box(body, 'front-bumper', [0.16, 0.18, 1.28], 0x1b252a, [-1.47, 0.43, 0], { metalness: 0.28, roughness: 0.3 });
  box(body, 'front-grille', [0.045, 0.23, 0.54], 0x101719, [-1.51, 0.68, 0], { metalness: 0.48, roughness: 0.32 });
  for (const grilleZ of [-0.18, -0.09, 0, 0.09, 0.18]) {
    box(body, 'grille-slat', [0.012, 0.018, 0.42], 0x9ba7a4, [-1.539, 0.68, grilleZ], { metalness: 0.78, roughness: 0.24 });
  }
  box(body, 'front-plate', [0.025, 0.095, 0.33], 0xd8d5cb, [-1.55, 0.48, 0], { metalness: 0.16, roughness: 0.44 });
  box(body, 'rear-bumper', [0.16, 0.17, 1.27], 0x20292c, [1.47, 0.43, 0], { metalness: 0.26, roughness: 0.32 });
  box(body, 'rear-plate', [0.026, 0.09, 0.31], 0xd2cfc5, [1.56, 0.48, 0]);
  for (const exhaustSide of [-1, 1]) {
    cylinder(body, 'exhaust', 0.055, 0.055, 0.12, 0x89908d, [1.48, 0.34, exhaustSide * 0.4], { metalness: 0.78, roughness: 0.26 });
  }
  for (const side of [-1, 1]) {
    const lamp = box(body, 'headlamp', [0.09, 0.15, 0.3], 0xf4eddb, [-1.49, 0.78, side * 0.45], {
      emissive: 0xffe3ad, emissiveIntensity: 1.6, roughness: 0.2,
    });
    lamp.material.toneMapped = false;
    box(body, 'tail-lamp', [0.085, 0.18, 0.3], 0xa64038, [1.49, 0.77, side * 0.45], {
      emissive: 0xea4538, emissiveIntensity: 1.15, roughness: 0.22,
    });
    box(body, 'amber-indicator', [0.06, 0.075, 0.14], 0xf0a84e, [-1.49, 0.65, side * 0.61], {
      emissive: 0xe78c38, emissiveIntensity: 0.6, roughness: 0.25,
    });
  }
  return car;
}

function buildRoom(world) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 30),
    new THREE.MeshStandardMaterial({ color: 0x321d2a, roughness: 0.86 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  world.add(floor);

  box(world, 'back-wall', [22, 11, 0.38], 0x321923, [0, 5.3, -5], { roughness: 0.92 });
  box(world, 'window-glow', [5.1, 4.1, 0.08], 0x633044, [-3.9, 5.2, -4.76], {
    emissive: 0xa13a61, emissiveIntensity: 0.48, roughness: 0.24,
  });
  for (const x of [-6.5, -1.3]) box(world, 'window-frame-v', [0.12, 4.5, 0.18], 0xb19a79, [x, 5.2, -4.63]);
  box(world, 'window-frame-h', [5.4, 0.13, 0.18], 0xb19a79, [-3.9, 5.2, -4.63]);
  box(world, 'window-sill', [5.7, 0.18, 0.3], 0xb19a79, [-3.9, 3.05, -4.53]);
  box(world, 'bed', [3.3, 0.52, 2.8], 0x4a2637, [3.6, 0.28, -1]);
  box(world, 'bed-cover', [3.26, 0.2, 2.75], 0x753d58, [3.6, 0.66, -1]);
  box(world, 'nightstand', [1.25, 0.78, 0.9], 0x63333a, [-1.9, 0.4, 1.7]);
  const lamp = new THREE.PointLight(0xf58aa4, 17, 9, 2);
  lamp.position.set(-1.9, 2.1, 1.6);
  world.add(lamp);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.48, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xdf9aaa, side: THREE.DoubleSide, emissive: 0x743244, emissiveIntensity: 0.55 }),
  );
  shade.position.set(-1.9, 1.82, 1.6);
  world.add(shade);
  const nini = makeCharacter(world, { name: 'nini', x: -0.3, z: 0.2, dress: 0x73617b, girl: true });
  nini.rotation.y = -0.2;
}

function buildStreet(world, drive = false) {
  const pavement = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 34),
    new THREE.MeshStandardMaterial({ color: 0x1c0e18, roughness: 0.92 }),
  );
  pavement.rotation.x = -Math.PI / 2;
  pavement.position.y = -0.04;
  world.add(pavement);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 42),
    new THREE.MeshStandardMaterial({ color: 0x100b12, roughness: 0.3, metalness: 0.1 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.005;
  world.add(road);
  if (!drive) {
    for (const z of [-7, -3.8, -0.6, 2.6, 5.8]) box(world, 'road-dash', [0.13, 0.02, 1.6], 0x827f7a, [0, 0.02, z]);
  }
  for (const side of [-1, 1]) {
    const walk = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 42),
      new THREE.MeshStandardMaterial({ color: 0x351923, roughness: 0.9 }),
    );
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(side * 5.5, 0.01, 0);
    world.add(walk);
    for (let i = -1; i <= 1; i += 1) {
      const b = box(world, 'building', [2.8 + Math.random() * 1.6, 4.5 + Math.random() * 5.8, 3.5], 0x151b2a, [side * (10 + Math.random() * 2), 2.2, i * 8 - 2]);
      b.userData.trackPhase = Math.abs(b.position.z) * 0.3;
      for (const wx of [-0.65, 0.1, 0.85]) {
        const wy = 1 + ((i + 3) % 2) * 1.1;
        box(b, 'window', [0.27, 0.34, 0.035], i % 2 ? 0xc38764 : 0x4a7791, [wx, wy, 1.77], {
          emissive: i % 2 ? 0xaa653e : 0x315a75, emissiveIntensity: 1.15,
        });
      }
    }
    for (const z of [-5.2, 1, 7.2]) {
      const post = cylinder(world, 'streetlight-post', 0.045, 0.07, 4.7, 0x343846, [side * 4.6, 2.32, z]);
      post.rotation.z = side * 0.02;
      const glow = new THREE.PointLight(side === -1 ? 0xff91af : 0xf28ba8, 22, 9, 2);
      glow.position.set(side * 4.5, 4.42, z);
      world.add(glow);
      sphere(world, 'streetlight-globe', [0.12, 0.09, 0.12], 0xffc3d0, [side * 4.5, 4.57, z], {
        emissive: 0xff80a5, emissiveIntensity: 2.2,
      });
    }
  }

  const car = makeCar(world, drive ? 0 : 7.3, drive ? -0.15 : 0);
  if (!drive) car.rotation.y = Math.PI / 2;
  if (drive) {
    car.rotation.y = Math.PI / 2;
    car.position.z = 1.2;
    for (let i = 0; i < 14; i += 1) {
      const dash = box(world, 'moving-dash', [0.13, 0.025, 2.1], i % 2 ? 0x777177 : 0x9a8776, [0, 0.025, -i * 3.6]);
      dash.userData.loop = i * 3.6;
    }
    car.userData.drive = true;
    const driver = makeCharacter(car.userData.body, { name: 'deme-driver', x: 0.05, z: 0.06, dress: 0x536078, seated: true });
    driver.rotation.y = -Math.PI / 2;
    return { car, nini: null };
  }
  const nini = makeCharacter(world, { name: 'nini-outside', x: -3.1, z: 0.05, dress: 0x875b71, girl: true });
  nini.rotation.y = Math.PI / 2;
  const deme = makeCharacter(car.userData.body, { name: 'deme-driver', x: 0.28, z: 0, dress: 0x536078, seated: true });
  deme.rotation.y = -Math.PI / 2;
  deme.scale.setScalar(0.68);
  deme.position.y = 0.38;
  return { car, nini, deme };
}

export function buildRestaurant(world) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(38, 30),
    new THREE.MeshStandardMaterial({ color: 0x2f1622, roughness: 0.88 }),
  );
  floor.rotation.x = -Math.PI / 2;
  world.add(floor);
  box(world, 'restaurant-back-wall', [22, 11, 0.45], 0x3b1925, [0, 5.3, -5]);
  box(world, 'restaurant-window', [6.4, 4.5, 0.08], 0x51243c, [-5, 5.2, -4.74], {
    emissive: 0x87345b, emissiveIntensity: 0.6, roughness: 0.2,
  });
  for (const x of [-8.2, -1.8]) box(world, 'window-frame', [0.12, 4.8, 0.16], 0x735345, [x, 5.2, -4.62]);
  for (const x of [-7.4, -4.95, -2.6]) {
    for (const y of [4.1, 6.25]) box(world, 'window-grid', [2.25, 0.07, 0.16], 0x735345, [x, y, -4.62]);
  }
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.68, 1.72, 0.18, 48, 1),
    new THREE.MeshStandardMaterial({ color: 0x76563e, metalness: 0.06, roughness: 0.28 }),
  );
  table.name = 'dinner-table';
  table.position.set(0, 1.55, 0);
  table.castShadow = true;
  table.receiveShadow = true;
  world.add(table);
  table.scale.z = 0.78;
  const tableApron = cylinder(world, 'table-apron', 1.47, 1.52, 0.2, 0x4f392c, [0, 1.38, 0], { roughness: 0.42 });
  tableApron.scale.z = 0.78;
  const tableInlay = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.018, 6, 64),
    new THREE.MeshStandardMaterial({ color: 0xc19a68, metalness: 0.62, roughness: 0.3 }),
  );
  tableInlay.name = 'table-brass-inlay';
  tableInlay.rotation.x = Math.PI / 2;
  tableInlay.scale.z = 0.78;
  tableInlay.position.y = 1.635;
  world.add(tableInlay);
  box(world, 'table-runner', [2.65, 0.018, 0.56], 0x82705c, [0, 1.648, 0], { roughness: 0.95 });
  cylinder(world, 'table-pedestal', 0.17, 0.25, 1.28, 0x533b2c, [0, 0.82, 0], { metalness: 0.04, roughness: 0.42 });
  cylinder(world, 'table-foot', 0.58, 0.58, 0.12, 0x49372b, [0, 0.12, 0], { metalness: 0.18, roughness: 0.36 });
  const wood = 0x59432f;
  const upholstery = 0x4a4d4a;
  for (const side of [-1, 1]) {
    const seatX = side * 2.22;
    box(world, 'dinner-chair-back-frame', [0.13, 0.94, 0.88], wood, [side * 2.72, 1.04, 0], { roughness: 0.48 });
    box(world, 'dinner-chair-back-upholstery', [0.075, 0.72, 0.66], upholstery, [side * 2.63, 1.06, 0], { roughness: 0.82 });
    box(world, 'dinner-chair-seat-frame', [0.86, 0.12, 0.86], wood, [seatX, 0.55, 0], { roughness: 0.48 });
    box(world, 'dinner-chair-seat', [0.74, 0.1, 0.72], upholstery, [seatX, 0.64, 0], { roughness: 0.82 });
    for (const legSide of [-1, 1]) {
      for (const legFront of [-1, 1]) {
        box(world, 'chair-leg', [0.07, 0.53, 0.07], wood, [seatX + legSide * 0.31, 0.285, legFront * 0.31], { roughness: 0.46 });
      }
    }
  }
  const nini = makeCharacter(world, { name: 'nini-dinner', x: -2.23, z: 0.1, dress: 0x795762, girl: true, seated: true });
  nini.rotation.y = Math.PI / 2;
  const deme = makeCharacter(world, { name: 'deme-dinner', x: 2.23, z: 0.1, dress: 0x50667b, seated: true });
  deme.rotation.y = -Math.PI / 2;
  nini.visible = false;
  deme.visible = false;
  const demeEntry = makeCharacter(world, { name: 'deme-entry', x: 0.55, z: 5.5, dress: 0x536078, phone: false });
  demeEntry.rotation.y = Math.PI;
  const niniEntry = makeCharacter(world, { name: 'nini-entry', x: -0.45, z: 6.2, dress: 0x795762, girl: true, phone: false });
  niniEntry.rotation.y = Math.PI;
  for (const side of [-1, 1]) {
    const plateX = side * 0.83;
    cylinder(world, 'charger-plate', 0.43, 0.43, 0.035, 0xb9a98f, [plateX, 1.67, 0.16], { roughness: 0.34 });
    cylinder(world, side < 0 ? 'plate-nini' : 'plate-deme', 0.35, 0.35, 0.028, 0xf0e8dc, [plateX, 1.699, 0.16], { roughness: 0.24 });
    const plateRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.012, 5, 40),
      new THREE.MeshStandardMaterial({ color: 0xc2aa83, metalness: 0.24, roughness: 0.34 }),
    );
    plateRim.name = 'porcelain-plate-rim';
    plateRim.rotation.x = Math.PI / 2;
    plateRim.position.set(plateX, 1.716, 0.16);
    world.add(plateRim);

    // A small plated starter gives the place setting some life without filling the table with props.
    sphere(world, 'plated-starter', [0.2, 0.045, 0.15], side < 0 ? 0xc99b61 : 0x9aab72, [plateX, 1.741, 0.16], { roughness: 0.58 });
    for (const garnish of [-1, 1]) {
      sphere(world, 'herb-garnish', [0.045, 0.012, 0.03], 0x6f8b58, [plateX + garnish * 0.08, 1.779, 0.14], { roughness: 0.72 });
    }

    box(world, 'folded-linen-napkin', [0.28, 0.025, 0.22], 0xd6cbb9, [plateX - side * 0.51, 1.67, 0.17], { roughness: 0.98 });
    const forkX = plateX - side * 0.48;
    box(world, 'table-fork-handle', [0.2, 0.012, 0.018], 0xb3ad9f, [forkX + side * 0.11, 1.682, 0.16], { metalness: 0.72, roughness: 0.26 });
    for (const tine of [-1, 0, 1]) {
      box(world, 'table-fork-tine', [0.11, 0.012, 0.012], 0xb3ad9f, [forkX - side * 0.035, 1.682, 0.16 + tine * 0.035], { metalness: 0.72, roughness: 0.26 });
    }
    box(world, 'table-knife', [0.3, 0.014, 0.025], 0xb3ad9f, [plateX + side * 0.49, 1.682, 0.16], { metalness: 0.72, roughness: 0.24 });

    const glassProfile = [
      new THREE.Vector2(0, 0), new THREE.Vector2(0.105, 0.012), new THREE.Vector2(0.12, 0.025),
      new THREE.Vector2(0.028, 0.04), new THREE.Vector2(0.022, 0.2), new THREE.Vector2(0.14, 0.38),
      new THREE.Vector2(0.17, 0.44), new THREE.Vector2(0.165, 0.46), new THREE.Vector2(0.145, 0.455),
      new THREE.Vector2(0.12, 0.38), new THREE.Vector2(0.035, 0.2), new THREE.Vector2(0.03, 0.05),
      new THREE.Vector2(0, 0.05),
    ];
    const glass = new THREE.Mesh(
      new THREE.LatheGeometry(glassProfile, 20),
      new THREE.MeshPhysicalMaterial({ color: 0xe8e4dc, transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0.12, side: THREE.DoubleSide }),
    );
    glass.name = 'water-glass';
    glass.position.set(plateX + side * 0.42, 1.67, -0.44);
    world.add(glass);
    cylinder(world, 'glass-water', 0.09, 0.09, 0.1, 0xc0d0cf, [plateX + side * 0.42, 1.97, -0.44], { transparent: true, opacity: 0.32, roughness: 0.12 });
  }

  cylinder(world, 'centerpiece-vase', 0.12, 0.15, 0.34, 0x9ba9a0, [0, 1.83, -0.2], { transparent: true, opacity: 0.55, metalness: 0.15, roughness: 0.12 });
  cylinder(world, 'candle-holder', 0.12, 0.12, 0.045, 0xc4a16e, [0, 1.69, 0.57], { metalness: 0.72, roughness: 0.28 });
  cylinder(world, 'candle', 0.035, 0.035, 0.24, 0xffe1ad, [0, 1.82, 0.57], { emissive: 0xffae64, emissiveIntensity: 0.75 });
  for (const [x, z] of [[-0.18, -0.22], [0.14, -0.25], [0.02, -0.1]]) {
    cylinder(world, 'centerpiece-stem', 0.012, 0.012, 0.4, 0x58714d, [x, 2.02, z]);
    sphere(world, 'centerpiece-flower', [0.075, 0.065, 0.07], 0xd9b58a, [x, 2.22, z], { roughness: 0.75 });
  }
  for (const side of [-1, 1]) {
    const light = new THREE.PointLight(0xffd1a1, 9, 10, 1.8);
    light.position.set(side * 1.6, 3.6, 0.1);
    world.add(light);
    cylinder(world, 'pendant-cord', 0.018, 0.018, 1.2, 0x5c4946, [side * 1.6, 4.6, 0]);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.42, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xe3c39b, side: THREE.DoubleSide, emissive: 0x735a3c, emissiveIntensity: 0.28 }),
    );
    shade.position.set(side * 1.6, 3.93, 0);
    world.add(shade);
  }
  box(world, 'sideboard', [2.8, 1, 0.74], 0x503730, [5.4, 0.5, -2.5]);
  for (const x of [4.7, 5.4, 6.1]) {
    sphere(world, 'flower', [0.2, 0.24, 0.18], 0xe4a294, [x, 1.18, -2.3]);
    cylinder(world, 'flower-stem', 0.025, 0.03, 0.5, 0x54765e, [x, 0.94, -2.3]);
  }
  return { deme, nini, demeEntry, niniEntry };
}

export function addAmbient(world) {
  world.background = new THREE.Color(palette.night);
  world.fog = new THREE.FogExp2(palette.night, 0.027);
  world.add(new THREE.HemisphereLight(0xf4e8d8, 0x30292a, 2.0));
  const key = new THREE.DirectionalLight(0xffdfb8, 3.6);
  key.position.set(-5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -15;
  key.shadow.camera.right = 15;
  key.shadow.camera.top = 15;
  key.shadow.camera.bottom = -15;
  world.add(key);

  const count = 110;
  const coords = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    coords[i * 3] = (Math.random() - 0.5) * 35;
    coords[i * 3 + 1] = 1 + Math.random() * 16;
    coords[i * 3 + 2] = -14 - Math.random() * 14;
  }
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(coords, 3)),
    new THREE.PointsMaterial({ color: 0xe6c8bd, size: 0.035, transparent: true, opacity: 0.65 }),
  );
  world.add(stars);
}

export default function Scene({ stage }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return undefined;
    const world = new THREE.Scene();
    addAmbient(world);
    let movers = {};
    if (stage === 'opening') buildRoom(world);
    if (stage === 'pickup') movers = buildStreet(world, false);
    if (stage === 'drive') movers = buildStreet(world, true);
    if (stage === 'restaurant') buildRestaurant(world);

    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    const target = { x: 0, y: 1.45, z: 0 };
    const viewByStage = {
      opening: { position: [0.2, 4.1, 13.8], target: [0, 1.8, 0] },
      pickup: { position: [1.1, 4.15, 15.5], target: [0.3, 1.5, 0] },
      drive: { position: [4.5, 4.4, 13.6], target: [0, 1.5, 0] },
      restaurant: { position: [0.3, 4.7, 14.4], target: [0, 1.6, 0] },
    }[stage] ?? { position: [0, 4, 14], target: [0, 1.5, 0] };
    camera.position.set(...viewByStage.position);
    camera.lookAt(...viewByStage.target);
    target.x = viewByStage.target[0];
    target.y = viewByStage.target[1];
    target.z = viewByStage.target[2];

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    let width = 0;
    let height = 0;
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 650 ? 46 : 37;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (event) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 2;
    };
    host.addEventListener('pointermove', onPointerMove, { passive: true });
    let live = true;
    const clock = new THREE.Clock();
    const frame = () => {
      if (!live) return;
      const elapsed = clock.getElapsedTime();
      if (stage === 'opening') {
        const nini = world.getObjectByName('nini');
        if (nini) nini.position.y = Math.sin(elapsed * 1.35) * 0.025;
        const screen = world.getObjectByName('phone-glow');
        if (screen) screen.material.emissiveIntensity = 1.55 + Math.sin(elapsed * 2.3) * 0.38;
      }
      if (stage === 'pickup') {
        const progress = Math.min(1, elapsed / 4.8);
        if (movers.car) movers.car.position.x = 7.3 - progress * 5.9;
        if (movers.deme) movers.deme.position.x = 7.3 - progress * 5.9;
        if (movers.nini && elapsed > 4.2) movers.nini.position.x = THREE.MathUtils.lerp(-3.1, -0.6, Math.min(1, (elapsed - 4.2) / 3));
        if (movers.car && progress > 0.95) movers.car.rotation.y = Math.sin(elapsed * 0.9) * 0.015;
      }
      if (stage === 'drive') {
        world.traverse((object) => {
          if (object.name === 'moving-dash') object.position.z = -((elapsed * 8 + object.userData.loop) % 48) + 6;
          if (object.name === 'building') object.position.z = 8 - ((elapsed * 3.2 + object.userData.trackPhase) % 25);
        });
        if (movers.car?.userData.body) movers.car.userData.body.position.y = 0.018 * Math.sin(elapsed * 7);
      }
      if (stage === 'restaurant') {
        world.traverse((object) => {
          if (object.name === 'candle') object.scale.y = 0.86 + Math.sin(elapsed * 7 + object.position.x * 3) * 0.08;
        });
      }
      camera.position.x += (viewByStage.position[0] + pointerX * 0.32 - camera.position.x) * 0.025;
      camera.position.y += (viewByStage.position[1] - pointerY * 0.15 - camera.position.y) * 0.025;
      camera.lookAt(target.x + pointerX * 0.14, target.y - pointerY * 0.08, target.z);
      renderer.render(world, camera);
      requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeChild(renderer.domElement);
      renderer.dispose();
      world.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose?.());
        else object.material?.dispose?.();
      });
    };
  }, [stage]);

  return <div className={`three-scene three-scene--${stage}`} ref={mountRef} />;
}
