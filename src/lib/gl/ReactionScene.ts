import * as THREE from "three";
import { displace, iridescence, simplex } from "./glsl.ts";

const FOV = 35;
const CAMERA_Z = 10;
const PARTICLES = 18000;

const blobVertex = /* glsl */ `
${simplex}
${displace}
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vObj;
varying float vDisp;

vec3 surface(vec3 n) {
	return n * (1.0 + displace(n));
}

void main() {
	vec3 n = normalize(position);
	vec3 p = surface(n);
	vec3 a = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
	vec3 t = normalize(cross(n, a));
	vec3 b = normalize(cross(n, t));
	float eps = 0.012;
	vec3 p1 = surface(normalize(n + t * eps));
	vec3 p2 = surface(normalize(n + b * eps));
	vec3 normal = normalize(cross(p1 - p, p2 - p));
	if (dot(normal, n) < 0.0) normal = -normal;

	vDisp = length(p) - 1.0;
	vObj = n;
	vec4 world = modelMatrix * vec4(p, 1.0);
	vWorldPos = world.xyz;
	vNormalW = normalize(mat3(modelMatrix) * normal);
	gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const blobFragment = /* glsl */ `
${simplex}
${iridescence}
uniform float uTime;
uniform float uDissolve;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vObj;
varying float vDisp;

vec3 studio(vec3 r) {
	vec3 col = mix(vec3(0.015, 0.015, 0.02), vec3(0.16, 0.16, 0.2), smoothstep(-0.3, 1.0, r.y));
	col += vec3(1.0) * smoothstep(0.5, 0.56, r.y) * smoothstep(0.86, 0.7, r.y) * 1.3;
	col += vec3(0.85, 0.9, 1.0) * pow(max(0.0, dot(r, normalize(vec3(-0.65, 0.35, 0.7)))), 18.0) * 3.0;
	col += vec3(1.0, 0.62, 0.25) * pow(max(0.0, dot(r, normalize(vec3(0.85, -0.25, 0.45)))), 8.0) * 1.1;
	col += vec3(0.3, 0.5, 1.0) * pow(max(0.0, dot(r, normalize(vec3(-0.2, -0.9, 0.3)))), 6.0) * 0.6;
	return col;
}

void main() {
	float n = snoise(vObj * 2.2 + 3.0) * 0.5 + 0.5;
	float edge = uDissolve * 1.2 - 0.1;
	if (n < edge) discard;

	vec3 N = normalize(vNormalW);
	vec3 V = normalize(cameraPosition - vWorldPos);
	float NdV = clamp(dot(N, V), 0.0, 1.0);
	float fresnel = pow(1.0 - NdV, 2.2);
	vec3 R = reflect(-V, N);

	vec3 film = thinFilm(NdV * 1.4 + vDisp * 3.0 + uTime * 0.035);
	vec3 col = studio(R) * mix(vec3(0.9), film, 0.7);
	col += film * fresnel * 0.85;
	col += pow(fresnel, 4.0) * 0.4;

	float burn = smoothstep(edge + 0.07, edge, n) * step(0.001, uDissolve);
	col = mix(col, vec3(1.0, 0.78, 0.4) * 2.4, burn);
	gl_FragColor = vec4(col, 1.0);
}
`;

const particleVertex = /* glsl */ `
${simplex}
${displace}
${iridescence}
attribute vec3 aTarget;
attribute vec3 aColor;
attribute float aRand;
uniform mat4 uBlobMatrix;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vRand;

float easeInOut(float t) {
	return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
	vec3 n = normalize(position);
	vec3 start = (uBlobMatrix * vec4(n * (1.0 + displace(n)), 1.0)).xyz;

	float t = clamp((uMorph - aRand * 0.35) / 0.65, 0.0, 1.0);
	float e = easeInOut(t);
	vec3 pos = mix(start, aTarget, e);
	float flight = sin(e * 3.14159);
	vec3 q = start * 0.7 + uTime * 0.15;
	pos += vec3(snoise(q), snoise(q + 17.0), snoise(q + 31.0)) * 1.6 * flight;
	pos.xy += vec2(sin(uTime * 1.7 + aRand * 60.0), cos(uTime * 1.3 + aRand * 40.0)) * 0.006 * e;

	vec4 mv = viewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (10.0 / -mv.z) * (1.0 + flight * 0.8);

	vec3 film = thinFilm(aRand + uTime * 0.05 + n.y * 0.5);
	vColor = mix(film, aColor, smoothstep(0.35, 0.95, e));
	vRand = aRand;
}
`;

const particleFragment = /* glsl */ `
uniform float uAlpha;
varying vec3 vColor;
varying float vRand;

void main() {
	float d = length(gl_PointCoord - 0.5);
	float a = smoothstep(0.5, 0.05, d);
	gl_FragColor = vec4(vColor * 1.25, a * uAlpha * (0.55 + vRand * 0.45));
}
`;

export interface TargetRect {
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
}

export interface ReactionProgress {
	/** 0 = intact blob, 1 = blob fully burnt away */
	dissolve: number;
	/** 0 = particles on the blob, 1 = particles on the table tiles */
	morph: number;
	/** particle opacity */
	alpha: number;
}

function pointInside(r: TargetRect): [number, number] {
	return [r.x + Math.random() * r.w, r.y + Math.random() * r.h];
}

function pointOnOutline(r: TargetRect): [number, number] {
	const t = Math.random();
	switch (Math.floor(Math.random() * 4)) {
		case 0:
			return [r.x + t * r.w, r.y];
		case 1:
			return [r.x + r.w, r.y + t * r.h];
		case 2:
			return [r.x + t * r.w, r.y + r.h];
		default:
			return [r.x, r.y + t * r.h];
	}
}

/** Liquid metal blob that disintegrates into particles which assemble into the periodic table. */
export class ReactionScene {
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
	private blob: THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial>;
	private particles: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
	private shared = {
		uTime: { value: 0 },
		uPointer: { value: new THREE.Vector3(0, 0, 1) },
		uPointerStrength: { value: 0 },
	};
	private pointer = new THREE.Vector2(0, 0);
	private pointerTarget = new THREE.Vector3(0, 0, 1);
	private pointerHit = false;
	private raycaster = new THREE.Raycaster();
	private hitSphere = new THREE.Sphere();
	private last = 0;
	private elapsed = 0;
	private width = 1;
	private height = 1;
	private running = false;

	constructor(canvas: HTMLCanvasElement) {
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.camera.position.z = CAMERA_Z;

		this.blob = new THREE.Mesh(
			new THREE.IcosahedronGeometry(1, 72),
			new THREE.ShaderMaterial({
				vertexShader: blobVertex,
				fragmentShader: blobFragment,
				uniforms: { ...this.shared, uDissolve: { value: 0 } },
			}),
		);
		this.scene.add(this.blob);

		const geometry = new THREE.BufferGeometry();
		const sphere = new Float32Array(PARTICLES * 3);
		const rand = new Float32Array(PARTICLES);
		for (let i = 0; i < PARTICLES; i++) {
			const u = Math.random() * 2 - 1;
			const phi = Math.random() * Math.PI * 2;
			const r = Math.sqrt(1 - u * u);
			sphere.set([r * Math.cos(phi), r * Math.sin(phi), u], i * 3);
			rand[i] = Math.random();
		}
		geometry.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
		geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
		geometry.setAttribute("aTarget", new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3));
		geometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(PARTICLES * 3).fill(1), 3));

		this.particles = new THREE.Points(
			geometry,
			new THREE.ShaderMaterial({
				vertexShader: particleVertex,
				fragmentShader: particleFragment,
				uniforms: {
					...this.shared,
					uBlobMatrix: { value: new THREE.Matrix4() },
					uMorph: { value: 0 },
					uAlpha: { value: 0 },
					uSize: { value: 2.2 },
					uPixelRatio: { value: this.renderer.getPixelRatio() },
				},
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		);
		this.particles.frustumCulled = false;
		this.scene.add(this.particles);
	}

	/** World-space size of the visible plane at z = 0. */
	private get view() {
		const h = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
		return { w: h * this.camera.aspect, h };
	}

	private toWorld(x: number, y: number): [number, number] {
		const { w, h } = this.view;
		return [(x / this.width - 0.5) * w, -(y / this.height - 0.5) * h];
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.renderer.setSize(width, height, false);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		const { w, h } = this.view;
		const portrait = width < height;
		const radius = Math.min(w, h) * (portrait ? 0.3 : 0.25);
		this.blob.scale.setScalar(radius);
		this.blob.position.set(portrait ? 0 : w * 0.08, h * 0.06, 0);
	}

	/** Spread particles over the tiles: mostly along their outline, some inside. */
	setTargets(rects: TargetRect[]) {
		if (!rects.length) return;
		const target = this.particles.geometry.getAttribute("aTarget") as THREE.BufferAttribute;
		const color = this.particles.geometry.getAttribute("aColor") as THREE.BufferAttribute;
		const c = new THREE.Color();
		for (let i = 0; i < PARTICLES; i++) {
			const r = rects[i % rects.length];
			const [px, py] = Math.random() < 0.6 ? pointOnOutline(r) : pointInside(r);
			const [wx, wy] = this.toWorld(px, py);
			target.setXYZ(i, wx, wy, (Math.random() - 0.5) * 0.05);
			c.set(r.color);
			color.setXYZ(i, c.r, c.g, c.b);
		}
		target.needsUpdate = true;
		color.needsUpdate = true;
	}

	setProgress({ dissolve, morph, alpha }: ReactionProgress) {
		this.blob.material.uniforms.uDissolve.value = dissolve;
		this.blob.visible = dissolve < 0.999;
		this.particles.material.uniforms.uMorph.value = morph;
		this.particles.material.uniforms.uAlpha.value = alpha;
		this.particles.visible = alpha > 0.001;
	}

	/** Pointer in canvas pixels; null when it leaves. */
	setPointer(x: number | null, y: number | null) {
		if (x === null || y === null) {
			this.pointerHit = false;
			return;
		}
		this.pointer.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
		this.raycaster.setFromCamera(this.pointer, this.camera);
		this.hitSphere.set(this.blob.position, this.blob.scale.x * 1.15);
		const hit = this.raycaster.ray.intersectSphere(this.hitSphere, new THREE.Vector3());
		this.pointerHit = !!hit;
		if (hit) {
			this.pointerTarget.copy(this.blob.worldToLocal(hit)).normalize();
		}
	}

	private frame = () => {
		const now = performance.now();
		const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0.016;
		this.last = now;
		const t = (this.elapsed += dt);
		this.shared.uTime.value = t;

		const strength = this.shared.uPointerStrength;
		strength.value += ((this.pointerHit ? 1 : 0) - strength.value) * dt * 4;
		this.shared.uPointer.value.lerp(this.pointerTarget, dt * 6).normalize();

		this.blob.rotation.y += dt * 0.12 + this.pointer.x * dt * 0.25;
		this.blob.rotation.x += (this.pointer.y * -0.35 - this.blob.rotation.x) * dt * 1.5;
		this.blob.rotation.z = Math.sin(t * 0.3) * 0.1;
		this.blob.updateMatrixWorld();
		this.particles.material.uniforms.uBlobMatrix.value.copy(this.blob.matrixWorld);

		this.renderer.render(this.scene, this.camera);
	};

	setRunning(running: boolean) {
		if (running === this.running) return;
		this.running = running;
		this.last = 0;
		this.renderer.setAnimationLoop(running ? this.frame : null);
		// Flush the final state so nothing stays frozen on screen.
		if (!running) this.renderer.render(this.scene, this.camera);
	}

	dispose() {
		this.setRunning(false);
		this.blob.geometry.dispose();
		this.blob.material.dispose();
		this.particles.geometry.dispose();
		this.particles.material.dispose();
		this.renderer.dispose();
		this.renderer.forceContextLoss();
	}
}
