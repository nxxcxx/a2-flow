import { Injectable } from 'angular2/core'

@Injectable()
export class SvgUIService {

	constructor() {
		window.SVGUI = this
		this.svgCanvas = null
		this.viewportCtrl = null
		this.viewport = null
	}

	initSvgCanvas( svgCanvasElem, viewportCtrlElem, viewportElem ) {
		this.svgCanvas = svgCanvasElem
		this.viewportCtrl = viewportCtrlElem
		this.viewport = viewportElem
	}

	getViewport() {
		return this.viewport
	}

	getInverseViewportMatrix() {
		return this.viewport.getScreenCTM().inverse()
	}

	createSVGPoint( x, y ) {
		let point = this.svgCanvas.createSVGPoint()
		point.x = x
		point.y = y
		return point
	}

	getMousePositionSVG( $event ) {
		// return relative mouse position in SVG element
		let pos = this.createSVGPoint( $event.clientX, $event.clientY )
		return pos.matrixTransform( this.getInverseViewportMatrix() )
	}

	addEventListener( eventName, fn ) {
		this.svgCanvas.addEventListener( eventName, fn )
	}

	removeEventListener( eventName, fn ) {
		this.svgCanvas.removeEventListener( eventName, fn )
	}

}
