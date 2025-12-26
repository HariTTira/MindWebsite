import * as THREE from 'three'
import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'
import type { AbstractMental } from '../AbstractMental'

export class BadMental extends Mental {
  attractionStrength: number

  attractionRange: number

  constructor(options: MentalBaseOptions & {
    attractionStrength?: number
    attractionRange?: number
  } = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('bad')
    }
    
    this.attractionStrength = options.attractionStrength ?? 0.001
    this.attractionRange = options.attractionRange ?? 0.5
  }

  createGeometry(): void {
    this.geometry = new THREE.IcosahedronGeometry(1, 0)
  }

  applyCustomPhysics(otherMentals: AbstractMental[]): void {
    const myPosition = this.getPosition()
    const myVelocity = this.getVelocity()

    const nearbyBadMentals = otherMentals.filter(mental => {
      const isBad = mental.getType() === 'bad' || mental instanceof BadMental
      if (!isBad) return false

      const otherPosition = mental.getPosition()
      const dx = otherPosition.x - myPosition.x
      const dy = otherPosition.y - myPosition.y
      const dz = otherPosition.z - myPosition.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      return distance > 0 && distance < this.attractionRange
    })

    if (nearbyBadMentals.length === 0) return

    let totalForceX = 0
    let totalForceY = 0
    let totalForceZ = 0

    nearbyBadMentals.forEach(mental => {
      const otherPosition = mental.getPosition()
      const dx = otherPosition.x - myPosition.x
      const dy = otherPosition.y - myPosition.y
      const dz = otherPosition.z - myPosition.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (distance > 0) {
        const dirX = dx / distance
        const dirY = dy / distance
        const dirZ = dz / distance

        const minDistance = 0.01
        const safeDistance = Math.max(distance, minDistance)
        const force = this.attractionStrength / (safeDistance * safeDistance)

        totalForceX += dirX * force
        totalForceY += dirY * force
        totalForceZ += dirZ * force
      }
    })

    const newVelX = myVelocity.x + totalForceX
    const newVelY = myVelocity.y + totalForceY
    const newVelZ = myVelocity.z + totalForceZ

    this.setVelocity(newVelX, newVelY, newVelZ)
  }

  setAttractionStrength(strength: number): void {
    this.attractionStrength = Math.max(0, strength)
  }

  getAttractionStrength(): number {
    return this.attractionStrength
  }

  setAttractionRange(range: number): void {
    this.attractionRange = Math.max(0, range)
  }

  getAttractionRange(): number {
    return this.attractionRange
  }
}

export default BadMental

