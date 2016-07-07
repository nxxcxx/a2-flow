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
		this.renderer = new window.THREE.WebGLRenderer( {
			canvas: this.canvas.nativeElement,
			alpha: true,
			antialias: true
		} )
		this.ngs.registerRenderer( this.renderer )
	}

	ngAfterViewInit() {
		let viewport = this.ngs.getViewportElem()
		$( window ).on( 'resize', () => {
			this.renderer.setSize( viewport.width(), viewport.height() )
		} ).trigger( 'resize' )
	}

}
