import { Component, ViewChild } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import $ from 'jquery'

@Component( {

	selector: 'nodeCanvas',
	template:
	`
		<canvas #canvas id="canvas" style="
			position: absolute;
			bottom: 0px; right: 0px;
			border: 1px solid white;
			transform-style: preserve-3d; // fix webkit opacity perf issue
		">
		</canvas>
	`

} )
export class NodeCanvas {

	@ViewChild( 'canvas' ) canvas

	constructor( ngs: NodeGraphService) {
		this.ngs = ngs
		this.renderer = null
	}

	ngOnInit() {
		window.RENDERER = new window.THREE.WebGLRenderer( {
			canvas: this.canvas.nativeElement,
			alpha: true,
			antialias: true
		} )
	}

	ngAfterViewInit() {
		let canvas = this.canvas.nativeElement
		, viewport = this.ngs.getViewportElem()
		window.CANVAS = canvas
		updateCanvas()
		$( window ).on( 'resize', updateCanvas )
		function updateCanvas() {
			window.WW = viewport.width()
			window.HH = viewport.height()
			window.CANVAS.width = window.WW
			window.CANVAS.height = window.HH
			window.RENDERER.setSize( window.WW, window.HH )
		}
	}

}
