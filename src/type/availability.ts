export interface ResourceAvailability {
  status: 'available' | 'unavailable' | 'unknown'
  code: string
  message: string
}

export interface MediaAvailability {
  status: 'available' | 'unavailable' | 'partial' | 'unknown' | 'unmonitored'
  unavailablePaths: number
  unknownPaths: number
}
