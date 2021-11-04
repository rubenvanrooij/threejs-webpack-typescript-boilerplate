import { Mesh, Vector3 } from "three";
import { DRAG } from "./constants";

export class Particle {

    private invMass = 1 / this.mass;
    private previous = this.position;
    private original = this.position.clone();
    private acceleration = new Vector3();
    private zPos = Math.random() * 4 - 2;

    // tmp vectors used for caclutions
    private tmp = [new Vector3(), new Vector3(), new Vector3()];

    constructor(public position: THREE.Vector3, private mass: number) {
    }  

    public addForce(force: Vector3) {
        this.acceleration.add(
            force.clone().multiplyScalar( this.invMass )
        )
    }

    public pin() {
        this.position = this.original.clone();
    }

    public update() {
        // Add force towards original position
        const distance = this.original.distanceTo(this.position);

        if(distance < 0.1) {
            return;
        }

        const direction = new Vector3().subVectors(this.original, this.position).normalize();
        this.addForce(direction.multiplyScalar(distance * Math.random() * 10));
    }

    // Verlet integration
    public integrate(timesq: number) {
        const newPos = this.tmp[0].subVectors( this.position, this.previous );
        newPos.multiplyScalar( DRAG ).add( this.position );

		newPos.add( this.acceleration.multiplyScalar( timesq ) );
        this.tmp[0] = this.previous.clone();
		this.previous = this.position;
		this.position = newPos;
        this.position.z = this.zPos; // lock z axe
    
        // Reset acceleration
		this.acceleration.set( 0, 0, 0 );
    }

    public reset() {
        this.tmp = [new Vector3(), new Vector3()];
        this.previous = this.original.clone();
        this.position = this.original.clone();
        this.acceleration = new Vector3()
    }
}