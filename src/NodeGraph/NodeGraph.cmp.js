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
		style="pointer-events: none; position: absolute; width: 4000px; height: 4000px;
				transform-origin: 0px 0px; transform: matrix(1,0,0,1,0,0) "
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
		$event.preventDefault()
		let container = $( this.container.nativeElement )
		, mat = container.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
		, viewport = this.ngs.getContainerElem()
		, viewportOffset = viewport.offset()
		, dd = Math.sign( $event.wheelDelta ) * 0.1
		, ss = mat[ 0 ] * ( 1.0 + dd )
		, sd = ss / mat[ 0 ]
		, ox = $event.clientX - viewportOffset.left + viewport.scrollLeft()
		, oy = $event.clientY - viewportOffset.top + viewport.scrollTop()
		, cx = mat[ 4 ]
		, cy = mat[ 5 ]
		, xx = sd * ( cx - ox ) + ox
		, yy = sd * ( cy - oy ) + oy
		if ( ss <= 0.2 ) return // clamp scaling
		container.css( 'transform', `matrix(${ss},0,0,${ss},${xx},${yy})` )
		this.ngs.zoomFactor = ss
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		if ( !( $event.target === this.ngs.getContainerElem()[ 0 ] ) ) return
		this.mousehold = true
		this.prevMouse = { x: $event.clientX, y: $event.clientY }
	}

	@HostListener( 'mouseup' ) onMouseUp() {
		this.mousehold = false
	}

	@HostListener( 'mousemove', [ '$event' ] ) onMouseMove( $event ) {
		if ( !( $event.target === this.ngs.getContainerElem().get(0) ) ) return
		if ( this.mousehold  ) {
			let dt = { x: $event.clientX - this.prevMouse.x, y: $event.clientY - this.prevMouse.y }
			let prevScrollTop = this.ngs.getContainerElem().scrollTop()
			let prevScrollLeft = this.ngs.getContainerElem().scrollLeft()
			this.ngs.getContainerElem().scrollTop( prevScrollTop - dt.y )
			this.ngs.getContainerElem().scrollLeft( prevScrollLeft - dt.x )
			this.prevMouse = { x: $event.clientX, y: $event.clientY }
		}
	}

	@HostListener( 'contextmenu', [ '$event' ] ) onContextMenu( $event ) {
		$event.preventDefault()
	}

}
