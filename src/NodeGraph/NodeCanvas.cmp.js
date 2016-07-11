import { Component, ViewChild } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import $ from 'jquery'

@Component( {

	selector: 'nodeCanvas',
	template:
	`
		<canvas #canvas id="canvas" style="position: absolute; top: 0px; right: 0px; transform-style: preserve-3d;">
		</canvas>
	`

} )
export class NodeCanvas {

	@ViewChild( 'canvas' ) canvas

	constructor( _reg: NodeRegistryService ) {
		this.ngs = _reg.request( 'NodeGraph' )
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
		$( window ).on( 'resize', () => {
			let viewport = this.ngs.getViewportElem()
			this.renderer.setSize( viewport.width(), viewport.height() )
		} ).trigger( 'resize' )
	}

}
