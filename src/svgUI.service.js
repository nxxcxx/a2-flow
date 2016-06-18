import { Injectable } from 'angular2/core'

@Injectable()
export class SvgUIService {

	constructor() {
		this.scalingFactor = 1.0
	}

	setScalingFactor( v ) {
		this.scalingFactor = v
	}

	getScalingFactor() {
		return this.scalingFactor
	}

}
