import * as THREE from 'three';
import { smoothMax } from './math';
import { perlin3, seed } from './perlin-noise';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export class BlobGeometry {

    public readonly geometry: THREE.BufferGeometry

    constructor(radius: number, detail: number) {

        const sphereGeometry = new  THREE.OctahedronGeometry(radius, detail)

        console.log(THREE.BufferGeometryUtils)

        this.geometry = mergeVertices(sphereGeometry)// THREE.BufferGeometryUtils.mergeVertices(sphereGeometry);

        seed(detail)

        this.geometry.setAttribute("basePosition", this.geometry.getAttribute('position').clone());
    }

    public update(offset: number, noiseScalar: number): void {

        const basePositionAttribute = this.geometry.getAttribute("basePosition");
        const positionAttribute = this.geometry.getAttribute( 'position' );
        const vertex = new THREE.Vector3();

        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {

            vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );
            
            const perlinValue = perlin3(vertex.x + offset, vertex.y + offset, vertex.z + offset);

            vertex.multiplyScalar( 0.8 + perlinValue * noiseScalar );

            positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);

        }

        this.geometry.attributes.position.needsUpdate = true; // required after the first render
        this.geometry.computeBoundingSphere();
    }

    public update2(offset: number, scale: number, octaves: number, persistance: number, lacunarity: number, amplitude: number, frequency: number): void {

        const basePositionAttribute = this.geometry.getAttribute("basePosition");
        const positionAttribute = this.geometry.getAttribute( 'position' );
        const vertex = new THREE.Vector3();

        let maxNoiseHeight = Number.MIN_VALUE;
        let minNoiseHeight = Number.MAX_VALUE;

        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {

            let _amplitude = amplitude;
            let _frequency = frequency;
            let noise = 0;

            vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );

            for (let i = 0; i < octaves; i++) {
                const sampleX = vertex.x / scale * _frequency;
                const sampleY = vertex.y / scale * _frequency;
                const sampleZ = vertex.z / scale * _frequency;
                const perlinValue = perlin3(sampleX + offset, sampleY + offset, sampleZ + offset);

                noise += perlinValue * _amplitude;

                _amplitude *= persistance;
                _frequency *= lacunarity;
            }

            const finalHeight = 1 +  noise * 0.1;
            maxNoiseHeight = Math.max(finalHeight, maxNoiseHeight);
            minNoiseHeight = Math.min(finalHeight, minNoiseHeight);

            vertex.multiplyScalar( finalHeight );

            positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
        }

        this.geometry.attributes.position.needsUpdate = true; // required after the first render
        this.geometry.computeBoundingSphere();
        this.geometry.computeVertexNormals()
    }
}