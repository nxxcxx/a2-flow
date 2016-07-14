import { Component, ElementRef, HostListener, ViewChild } from '@angular/core'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'
import { NodeTempConnection } from 'src/NodeGraph/NodeConnection/NodeTempConnection.cmp'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { SelectionBox } from 'src/NodeGraph/SelectionBox.cmp'
const html = String.raw

@Component( {

	selector: '[nodeGraph]',
	directives: [ NodeModule, NodeConnection, NodeTempConnection, SelectionBox ],
	styles: [ require( '!raw!sass!root/sass/NodeGraph.cmp.sass') ],
	template:
	html`
	<div #container class="nodeGraphContainer"
		style="pointer-events: none; position: absolute; width: 5000px; height: 5000px;
			transform-origin: 0px 0px; transform: matrix(1,0,0,1,0,0);
		"
	>

		<svg class="nodeContainerSvg">
			<g nodeConnection *ngFor="let conn of ngs.getConnections()"
				[connection]="conn"
				[x1]="conn[ 0 ].position.x" [y1]="conn[ 0 ].position.y"
				[x2]="conn[ 1 ].position.x" [y2]="conn[ 1 ].position.y"
			/>
			<g nodeTempConnection />
		</svg>

		<div class="nodeContainer">
			<div nodeModule *ngFor="let node of ngs.getNodes()" [node]="node"></div>
		</div>

	</div>

	<div selectionBox></div>
	`

} )
export class NodeGraph {

	@ViewChild( 'container' ) container
	@ViewChild( 'canvas' ) canvas

	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.el = elRef.nativeElement
		this.clampScale = 0.2
	}

	ngOnInit() {
		this.ngs.registerViewportElem( this.el )
		this.ngs.registerNodeContainerElem( this.container.nativeElement )
	}

	@HostListener( 'wheel', [ '$event' ] ) onMouseWheel( $event ) {
		$event.preventDefault()
		let mat = this.ngs.getNodeContainerTransformationMatrix()
		, viewport = this.ngs.getViewportElem()
		, viewportOffset = viewport.offset()
		, dd = - Math.sign( $event.deltaY ) * 0.1
		, ss = Math.max( mat[ 0 ] * ( 1.0 + dd ), this.clampScale )
		, sd = ss / mat[ 0 ]
		, ox = $event.clientX - viewportOffset.left + viewport.scrollLeft()
		, oy = $event.clientY - viewportOffset.top + viewport.scrollTop()
		, xx = sd * ( mat[ 4 ] - ox ) + ox
		, yy = sd * ( mat[ 5 ] - oy ) + oy
		this.ngs.getNodeContainerElem().css( 'transform', `matrix(${ss},0,0,${ss},${xx},${yy})` )
		this._store.zoomFactor = ss
		// TODO: cleanup
		this._store.nodes.forEach( n => {
			let isInSelection = !!this.ngs.getSelectedNodes().find( sn => sn === n )
			if ( n !== this.node && isInSelection ) {
				n._ngComponent.resetPrevPos()
			}
		} )
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		if ( $event.which !== 2 || $event.target !== this.ngs.getViewportElem()[ 0 ] ) return
		this.mousehold = true
		this.prevMouse = { x: $event.clientX, y: $event.clientY }
	}

	@HostListener( 'mouseup' ) onMouseUp() {
		this.mousehold = false
	}

	@HostListener( 'mousemove', [ '$event' ] ) onMouseMove( $event ) {
		let viewport = this.ngs.getViewportElem()
		if ( !this.mousehold || ( $event.target !== viewport.get(0) ) ) return
		let dt = { x: $event.clientX - this.prevMouse.x, y: $event.clientY - this.prevMouse.y }
		viewport.scrollTop( viewport.scrollTop() - dt.y )
		viewport.scrollLeft( viewport.scrollLeft() - dt.x )
		this.prevMouse = { x: $event.clientX, y: $event.clientY }
	}

	@HostListener( 'contextmenu', [ '$event' ] ) onContextMenu( $event ) {
		$event.preventDefault()
	}

}
