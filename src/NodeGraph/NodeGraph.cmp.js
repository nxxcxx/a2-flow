import { Component, ElementRef, HostListener, ViewChild } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'
import { NodeTempConnection } from 'src/NodeGraph/NodeConnection/NodeTempConnection.cmp'
import $ from 'jquery'

@Component( {

	selector: '[nodeGraph]',
	directives: [ NodeModule, NodeConnection, NodeTempConnection ],
	template:
	`
	<div #container id="nodeGraphContainer"
		style="pointer-events: none; position: absolute; width: 4000px; height: 4000px; transform-origin: 0px 0px"
	>

		<svg id="nodeContainerSvg" style="pointer-events: none">
			<g style="pointer-events: auto">
				<g nodeConnection *ngFor="let conn of ngs.getConnections()" [connection]="conn" />
				<g nodeTempConnection />
			</g>
		</svg>

		<div id="nodeContainer" style="pointer-events: none">
			<div style="pointer-events: auto">
				<nodeModule *ngFor="let node of ngs.getNodes()" [node]="node"></nodeModule>
			</div>
		</div>

	</div>
	`

} )
export class NodeGraph {

	@ViewChild( 'container' ) container

	constructor( elRef: ElementRef, ngs: NodeGraphService ) {
		this.ngs = ngs
		this.el = elRef.nativeElement
	}

	ngOnInit() {
		this.ngs.registerContainerElem( this.el )
	}

	@HostListener( 'mousewheel', [ '$event' ] ) onMouseWheel( $event ) {
		// TODO: use transform: scale
		// TODO: fix position after zoom for IO, mouse, ...
		$event.preventDefault()
		let dy = Math.sign( $event.wheelDelta )
		let container = $( this.container.nativeElement )



		if ( container.css( 'transform' ) === 'none' ) {
			container.css( 'transform', 'matrix(1,0,0,1,0,0)' )
		}
		let pz = container.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
		pz = pz[ 0 ]

		let gain = 0.05
		let zf = clamp( pz + dy * gain, 0.1, 2.0 )
		this.ngs.zoomFactor = zf




		// let viewport = this.ngs.getContainerElem()
		// let viewportOffset = viewport.offset()
		// let viewportScrollLeft = viewport.scrollLeft()
		// let viewportScrollTop = viewport.scrollTop()
		// let orig = [
		// 	( $event.clientX - viewportOffset.left + viewportScrollLeft ) / zf,
		// 	( $event.clientY - viewportOffset.top + viewportScrollTop ) / zf
		// ].map( v => v + 'px' ).join( ' ' )
		// container.css( 'transform-origin', orig )

		let xx = 0
		let yy = 0

		container.css( 'transform', `matrix(${zf},0,0,${zf},${xx},${yy})` )

		function clamp( v, min, max ) {
			return Math.min( max, Math.max( min, v ) )
		}
	}

}
