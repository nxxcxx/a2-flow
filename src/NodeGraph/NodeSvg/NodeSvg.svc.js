import { Injectable } from 'angular2/core'

@Injectable()
export class NodeSvgService {

	constructor() {
		window.SVGUI = this
		this.svgCanvas = null
		this.viewportCtrl = null
		this.viewport = null
		this.pendingEventListeners = []
	}

	initSvgCanvas( svgCanvasElem, viewportCtrlElem, viewportElem ) {
		this.svgCanvas = svgCanvasElem
		this.viewportCtrl = viewportCtrlElem
		this.viewport = viewportElem
		for ( let evt of this.pendingEventListeners ) {
			this.addEventListener( evt[ 0 ], evt[ 1 ] )
		}
		this.pendingEventListeners = []
	}

	getViewport() {
		return this.viewport
	}

	getInverseViewportMatrix() {
		return this.viewport.getScreenCTM().inverse()
	}

	getMousePositionSVG( $event ) {
		// return mouse position relative to svgCanvas
		let pos = this.svgCanvas.createSVGPoint()
		pos.x = $event.clientX
		pos.y = $event.clientY
		return pos.matrixTransform( this.getInverseViewportMatrix() )
	}

	addEventListener( eventName, fn ) {
		if ( this.svgCanvas === null ) {
			this.pendingEventListeners.push( [ eventName, fn ] )
		} else {
			this.svgCanvas.addEventListener( eventName, fn )
		}
	}

	removeEventListener( eventName, fn ) {
		this.svgCanvas.removeEventListener( eventName, fn )
	}

}
