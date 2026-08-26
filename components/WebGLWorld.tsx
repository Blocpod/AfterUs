"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export type MotionState = { progress: number; velocity: number; accent: string };

export default function WebGLWorld({ motion }: { motion: MutableRefObject<MotionState> }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const mobile = matchMedia("(max-width:760px)").matches;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.018);
    const camera = new THREE.PerspectiveCamera(mobile ? 66 : 58, host.clientWidth / host.clientHeight, 0.1, 240);
    camera.position.z = 7;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.15 : 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const count = mobile ? 620 : 1400;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index++) {
      const radius = 2.8 + Math.pow(Math.random(), 0.58) * 20;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.62;
      positions[index * 3 + 2] = -Math.random() * 155;
      seeds[index] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTravel: { value: 0 }, uVelocity: { value: 0 }, uHue: { value: new THREE.Color("#6ed5d3") } },
      vertexShader: `attribute float aSeed;uniform float uTravel,uVelocity;varying float vFade;void main(){vec3 p=position;p.z=mod(p.z+uTravel*210.0+155.0,155.0)-155.0;float w=p.z*.018+uTravel*6.283+aSeed*2.0;p.xy+=vec2(cos(w),sin(w))*(.08+uVelocity*.65);vec4 mv=modelViewMatrix*vec4(p,1.);vFade=smoothstep(1.,8.,-mv.z)*(.18+aSeed*.72);gl_PointSize=(1.+aSeed*3.+uVelocity*7.)*(22./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform vec3 uHue;varying float vFade;void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>.5)discard;float c=1.-smoothstep(.05,.5,d);gl_FragColor=vec4(mix(vec3(.88,.85,.75),uHue,.72),c*vFade);}`,
    });
    scene.add(new THREE.Points(geometry, material));

    const portals = new THREE.Group();
    const sharedGeometry = new THREE.TorusGeometry(4, 0.014, 4, 128);
    for (let index = 0; index < 12; index++) {
      const ringMaterial = new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xe34d32 : 0x71d7d3, transparent: true, opacity: index % 3 === 0 ? 0.16 : 0.055 });
      const ring = new THREE.Mesh(sharedGeometry, ringMaterial);
      ring.position.z = -index * 11.8;
      ring.scale.set(1 + index * 0.014, 0.64 + index * 0.008, 1);
      portals.add(ring);
    }
    scene.add(portals);

    const helixPoints: THREE.Vector3[] = [];
    for (let index = 0; index < 320; index++) {
      const time = index / 319;
      const angle = time * Math.PI * 18;
      helixPoints.push(new THREE.Vector3(Math.cos(angle) * (4.4 + time * 6), Math.sin(angle) * (2.7 + time * 3), -time * 155));
    }
    const helixGeometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x65d5d2, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending });
    const helix = new THREE.Line(helixGeometry, helixMaterial);
    const twin = helix.clone();
    twin.rotation.z = Math.PI;
    scene.add(helix, twin);

    let frame = 0;
    let smooth = motion.current.progress;
    let velocity = 0;
    let lastAccent = "";
    let visible = true;
    const draw = () => {
      if (visible) {
        smooth += (motion.current.progress - smooth) * (reduce ? 0.2 : 0.065);
        velocity += (Math.min(1, motion.current.velocity * 0.025) - velocity) * 0.08;
        material.uniforms.uTravel.value = smooth;
        material.uniforms.uVelocity.value = velocity;
        if (lastAccent !== motion.current.accent) {
          lastAccent = motion.current.accent;
          material.uniforms.uHue.value.set(lastAccent);
        }
        const travel = smooth * 210;
        portals.children.forEach((child, index) => {
          child.position.z = -((index * 11.8 - travel + 170) % 147);
          child.rotation.z = smooth * 2.2 + index * 0.08;
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (index % 3 === 0 ? 0.16 : 0.055) + velocity * 0.18;
        });
        helix.rotation.z = smooth * 5;
        twin.rotation.z = Math.PI - smooth * 3.8;
        camera.position.x = Math.sin(smooth * Math.PI * 12) * 0.28;
        camera.position.y = Math.cos(smooth * Math.PI * 9) * 0.12;
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(draw);
    };
    if (!reduce) draw(); else renderer.render(scene, camera);

    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const visibility = () => { visible = !document.hidden; };
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      geometry.dispose(); material.dispose(); sharedGeometry.dispose(); helixGeometry.dispose(); helixMaterial.dispose();
      portals.children.forEach((child) => ((child as THREE.Mesh).material as THREE.Material).dispose());
      renderer.dispose(); host.replaceChildren();
    };
  }, [motion]);

  return <div ref={mount} className="webgl" aria-hidden="true" />;
}
