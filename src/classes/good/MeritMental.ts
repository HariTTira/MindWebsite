import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'
import type { AbstractMental } from '../AbstractMental'
import * as THREE from 'three'

export class MeritMental extends Mental {
  directionChangeInterval: number

  private frameCounter: number

  constructor(options: MentalBaseOptions & {
    directionChangeInterval?: number
  } = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('merit')
    }
    
    this.directionChangeInterval = options.directionChangeInterval ?? 60
    this.frameCounter = 0

    this.dispose()
    this.createBubbleMesh()
  }

  createGeometry(): void {
    this.geometry = new THREE.SphereGeometry(
      1,
      this.widthSegments,
      this.heightSegments
    )
  }

  createMaterial(): void {
    this.material = new THREE.MeshPhysicalMaterial({
      color: this.color,
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
      transmission: 0.9,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      ior: 1.33
    })
  }

  private createBubbleMesh(): void {
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
  }

  applyCustomPhysics(_otherMentals: AbstractMental[]): void {
    this.frameCounter++
    
    if (this.frameCounter >= this.directionChangeInterval) {
      this.frameCounter = 0
      
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      const newVelocity = {
        x: this.motionSpeed * Math.sin(phi) * Math.cos(theta),
        y: this.motionSpeed * Math.sin(phi) * Math.sin(theta),
        z: this.motionSpeed * Math.cos(phi)
      }
      
      const transitionFactor = 0.3
      const currentVel = this.getVelocity()
      this.setVelocity(
        currentVel.x * (1 - transitionFactor) + newVelocity.x * transitionFactor,
        currentVel.y * (1 - transitionFactor) + newVelocity.y * transitionFactor,
        currentVel.z * (1 - transitionFactor) + newVelocity.z * transitionFactor
      )
    }
  }

  setColor(color: number | string): void {
    super.setColor(color)
    
    if (this.material instanceof THREE.MeshPhysicalMaterial) {
      this.material.color.setHex(this.color)
    }
  }

  setDirectionChangeInterval(interval: number): void {
    this.directionChangeInterval = Math.max(1, interval)
  }

  getDirectionChangeInterval(): number {
    return this.directionChangeInterval
  }
}

export default MeritMental

