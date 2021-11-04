import { Float32BufferAttribute } from "three";
import * as THREE from 'three';
export class Plane extends THREE.BufferGeometry {

	constructor(width: number, height: number) {
		super();
		this.type = 'Plane';

        const topLeftX = (width - 1) / -2.0;
		const topLeftY = (height - 1) / 2.0;

		const indices = [];
		const vertices = [];
		const normals = [];
		const colors = [];
		const uvs = [];

		let vertexIndex = 0;

		// generate vertices, normals and uvs
		for( let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++ ) {
				vertices.push(topLeftX + x, topLeftY - y, 0);
				uvs.push(x / width, y / height);
				normals.push( 0, 0, 0 ); // will be calculated afterwards
				colors.push( 1,0,0)
				if(x < width -1 && y < height - 1) {
					indices.push(vertexIndex, vertexIndex + width + 1, vertexIndex + width);
					indices.push(vertexIndex + width + 1, vertexIndex, vertexIndex + 1);
				}

				vertexIndex++;
			}
		}

        this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );
        this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
        
		this.computeVertexNormals();
	}
}