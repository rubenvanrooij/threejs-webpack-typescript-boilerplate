import { Vector3 } from "three";

export const TWO_PI = Math.PI * 2;
export const DAMPING = 0.03;
export const DRAG = 1 - DAMPING;
export const MASS = 0.1;
export const TIMESTEP = 18 / 1000;
export const TIMESTEP_SQ = TIMESTEP * TIMESTEP;
export const GRAVITY = 500;
export const GRAVITY_FORCE = new Vector3( 0, - GRAVITY, 0 ).multiplyScalar( MASS );
