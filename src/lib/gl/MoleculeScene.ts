import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Atom, Bond } from "#lib/data/molecules.ts";

export interface ProjectedAtom {
	x: number;
	y: number;
	/** -1 (back) .. 1 (front) */
	depth: number;
}

/** Force-directed 3D layout, computed once. */
function layout(atoms: Atom[], bonds: Bond[]): THREE.Vector3[] {
	const pos = atoms.map(() =>
		new THREE.Vector3().randomDirection().multiplyScalar(2 + Math.random() * 3),
	);
	const force = atoms.map(() => new THREE.Vector3());
	const tmp = new THREE.Vector3();
	for (let step = 0; step < 420; step++) {
		const cooling = 1 - step / 420;
		force.forEach((f) => f.set(0, 0, 0));
		for (let i = 0; i < pos.length; i++) {
			for (let j = i + 1; j < pos.length; j++) {
				tmp.subVectors(pos[i], pos[j]);
				const d2 = Math.max(tmp.lengthSq(), 0.05);
				tmp.multiplyScalar(3.2 / d2);
				force[i].add(tmp);
				force[j].sub(tmp);
			}
		}
		for (const b of bonds) {
			tmp.subVectors(pos[b.b], pos[b.a]);
			const d = tmp.length();
			tmp.multiplyScalar(((d - 2.1) * 0.05 * Math.sqrt(b.weight)) / Math.max(d, 0.001));
			force[b.a].add(tmp);
			force[b.b].sub(tmp);
		}
		pos.forEach((p, i) => {
			force[i].addScaledVector(p, -0.018);
			p.addScaledVector(force[i].clampLength(0, 0.5), cooling);
		});
	}
	// Normalise the cloud to a radius of ~5.6 units.
	const radius = Math.max(...pos.map((p) => p.length()));
	pos.forEach((p) => p.multiplyScalar(5.6 / radius));
	return pos;
}

/** Technologies as iridescent atoms, bonds as the projects that combined them. */
export class MoleculeScene {
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
	private group = new THREE.Group();
	private spheres: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>[] = [];
	private sticks: THREE.InstancedMesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
	private bonds: Bond[];
	private atomColors: THREE.Color[];
	private positions: THREE.Vector3[];
	private raycaster = new THREE.Raycaster();
	private ndc = new THREE.Vector2(9, 9);
	private velocity = new THREE.Vector2(0.0025, 0.0012);
	private dragging = false;
	private last = new THREE.Vector2();
	private width = 1;
	private height = 1;
	private hovered = -1;
	private neighbours: Set<number>[];
	private projected: ProjectedAtom[];
	private tmp = new THREE.Vector3();

	constructor(
		canvas: HTMLCanvasElement,
		atoms: Atom[],
		bonds: Bond[],
		private onFrame: (atoms: ProjectedAtom[]) => void,
		private onHover: (index: number) => void,
	) {
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.15;
		const pmrem = new THREE.PMREMGenerator(this.renderer);
		this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		pmrem.dispose();

		this.camera.position.z = 15;
		this.scene.add(this.group);
		this.positions = layout(atoms, bonds);
		this.projected = atoms.map(() => ({ x: 0, y: 0, depth: 0 }));
		this.atomColors = atoms.map((a) => new THREE.Color(a.color));
		this.neighbours = atoms.map(() => new Set<number>());
		for (const b of bonds) {
			this.neighbours[b.a].add(b.b);
			this.neighbours[b.b].add(b.a);
		}

		const geometry = new THREE.SphereGeometry(1, 48, 32);
		atoms.forEach((atom, i) => {
			const color = new THREE.Color(atom.color);
			const mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshPhysicalMaterial({
					color,
					metalness: 0.55,
					roughness: 0.1,
					clearcoat: 1,
					clearcoatRoughness: 0.08,
					iridescence: 1,
					iridescenceIOR: 1.35,
					iridescenceThicknessRange: [180, 620],
					emissive: color,
					emissiveIntensity: 0.12,
					transparent: true,
				}),
			);
			mesh.scale.setScalar(0.2 + 0.09 * atom.projects.length);
			mesh.userData.base = mesh.scale.x;
			mesh.position.copy(this.positions[i]);
			this.spheres.push(mesh);
			this.group.add(mesh);
		});

		// Ball-and-stick: one metal cylinder per bond.
		this.bonds = bonds;
		this.sticks = new THREE.InstancedMesh(
			new THREE.CylinderGeometry(1, 1, 1, 14, 1, true),
			new THREE.MeshStandardMaterial({ metalness: 0.85, roughness: 0.22, transparent: true }),
			bonds.length,
		);
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const dir = new THREE.Vector3();
		const mid = new THREE.Vector3();
		const up = new THREE.Vector3(0, 1, 0);
		bonds.forEach((b, i) => {
			const pa = this.positions[b.a];
			const pb = this.positions[b.b];
			dir.subVectors(pb, pa);
			const length = dir.length();
			q.setFromUnitVectors(up, dir.normalize());
			mid.addVectors(pa, pb).multiplyScalar(0.5);
			const r = 0.022 + 0.014 * Math.min(b.weight, 3);
			m.compose(mid, q, new THREE.Vector3(r, length, r));
			this.sticks.setMatrixAt(i, m);
		});
		this.paintBonds(-1);
		this.group.add(this.sticks);
	}

	/** Bonds take the blend of their two atoms; when one atom is focused, unrelated bonds go dark. */
	private paintBonds(focus: number) {
		const c = new THREE.Color();
		const white = new THREE.Color("#ffffff");
		const dark = new THREE.Color("#2a2a30");
		this.bonds.forEach((b, i) => {
			const related = focus < 0 || b.a === focus || b.b === focus;
			c.copy(this.atomColors[b.a]).lerp(this.atomColors[b.b], 0.5).lerp(white, 0.35);
			if (!related) c.copy(dark);
			this.sticks.setColorAt(i, c);
		});
		if (this.sticks.instanceColor) this.sticks.instanceColor.needsUpdate = true;
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.renderer.setSize(width, height, false);
		this.camera.aspect = width / height;
		// Keep the whole molecule in frame on narrow screens.
		this.camera.position.z = width < height ? 19 : 15.5;
		this.camera.updateProjectionMatrix();
	}

	pointerDown(x: number, y: number) {
		this.dragging = true;
		this.last.set(x, y);
		this.pointerMove(x, y);
	}

	pointerMove(x: number, y: number) {
		this.ndc.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
		if (this.dragging) {
			this.velocity.set((x - this.last.x) * 0.0016, (y - this.last.y) * 0.0016);
			this.last.set(x, y);
		}
	}

	pointerUp() {
		this.dragging = false;
	}

	pointerLeave() {
		this.dragging = false;
		this.ndc.set(9, 9);
	}

	private updateHover() {
		this.raycaster.setFromCamera(this.ndc, this.camera);
		const hit = this.raycaster.intersectObjects(this.spheres, false)[0];
		const index = hit ? this.spheres.indexOf(hit.object as (typeof this.spheres)[number]) : -1;
		if (index === this.hovered) return;
		this.hovered = index;
		this.paintBonds(index);
		this.onHover(index);
	}

	private frame = () => {
		const t = performance.now() / 1000;
		if (!this.dragging) {
			this.velocity.lerp(new THREE.Vector2(0.0025, 0.0008), 0.02);
		}
		this.group.rotation.y += this.velocity.x;
		this.group.rotation.x = THREE.MathUtils.clamp(this.group.rotation.x + this.velocity.y, -1.1, 1.1);
		this.group.updateMatrixWorld();
		this.updateHover();

		const focus = this.hovered;
		this.spheres.forEach((mesh, i) => {
			const lit = focus < 0 || i === focus || this.neighbours[focus].has(i);
			const target = mesh.userData.base * (i === focus ? 1.45 : 1) * (1 + Math.sin(t * 1.4 + i) * 0.04);
			mesh.scale.setScalar(mesh.scale.x + (target - mesh.scale.x) * 0.15);
			mesh.material.opacity += ((lit ? 1 : 0.18) - mesh.material.opacity) * 0.15;
			mesh.material.emissiveIntensity = i === focus ? 0.6 : 0.12;

			this.tmp.copy(mesh.position).applyMatrix4(this.group.matrixWorld);
			const depth = this.tmp.z / 5.6;
			this.tmp.project(this.camera);
			const p = this.projected[i];
			p.x = (this.tmp.x * 0.5 + 0.5) * this.width;
			p.y = (-this.tmp.y * 0.5 + 0.5) * this.height;
			p.depth = depth;
		});

		this.renderer.render(this.scene, this.camera);
		this.onFrame(this.projected);
	};

	setRunning(running: boolean) {
		this.renderer.setAnimationLoop(running ? this.frame : null);
	}

	dispose() {
		this.setRunning(false);
		this.spheres.forEach((s) => s.material.dispose());
		this.spheres[0]?.geometry.dispose();
		this.sticks.geometry.dispose();
		this.sticks.material.dispose();
		this.scene.environment?.dispose();
		this.renderer.dispose();
		this.renderer.forceContextLoss();
	}
}
