import { Injectable } from 'angular2/core'

@Injectable()
export class SvgUIService {

	constructor() {
		this.scalingFactor = 1.0
		// this.handler
		// this.handler.addEventListener( 'mousemove', $event => {
			// this.mouseX = $event.pageX
			// this.mouseY = $event.pageY
			// var handlerOffsetLeft = this.handler.getBoundingClientRect().left + document.body.scrollLeft - document.body.clientLeft
			// , handlerOffsetTop = this.handler.getBoundingClientRect().top + document.body.scrollTop - document.body.clientTop
			// , cx = this.mouseX - handlerOffsetLeft
			// , cy = this.mouseY - handlerOffsetTop
			// , pos = panCtrl.getPosition(); // pos is relative pan position of target
			// , ox = pos.x;
			// , oy = pos.y;
			// this.relativeMouseX = ( cx - ox ) / this.scalingFactor
			// this.relativeMouseY = ( cy - oy ) / this.scalingFactor
			//
		// } )
	}

	setScalingFactor( v ) {
		this.scalingFactor = v
	}

	getScalingFactor() {
		return this.scalingFactor
	}

}
