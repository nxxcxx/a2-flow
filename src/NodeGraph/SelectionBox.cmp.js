import { Component, ViewChild } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
const html = String.raw

@Component( {

	selector: '[selectionBox]',
	template:
	html`
		<div #box
			style="position: fixed; border: 1px solid #0bb1f9;"
			[ngStyle]="{
				width: width + 'px', height: height + 'px',
				top: top + 'px', left: left + 'px'
			}"
			[hidden]="!visible"
		></div>
	`

} )
export class SelectionBox {

	@ViewChild( 'box' ) box

	constructor( _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.prevPos = { x: 0, y: 0 }
		this.top = 0
		this.left = 0
		this.width = 0
		this.height = 0
	}

	ngOnInit() {
		// TODO: fix selection box not moving when scrolling
		let setPosition = ( t, l ) => { [ this.top, this.left ] = [ t, l ] }
		this.ngs.getViewportElem()
		.on( 'mousedown', $event => {
			if ( $event.which !== 1 || $event.target !== this.ngs.getViewportElem()[ 0 ] ) return
			this.mousehold = true
			this.prevPos = { x: $event.clientX, y: $event.clientY }
			this.prevPosRel = this.getMousePositionRelativeToContainer( $event )
			this.deselect()
		} )
		.on( 'mousemove', $event => {
			if ( !this.mousehold ) return
			this.deselect()
			this.visible = true
			let [ cp, pp ] = [ { x: $event.clientX, y: $event.clientY }, this.prevPos ]
			;[ this.width, this.height ] = [ cp.x - pp.x, cp.y - pp.y ].map( v => Math.abs( v ) )
			let ppr = this.ppr = this.prevPosRel
			let cpr = this.cpr = this.getMousePositionRelativeToContainer( $event )
			if ( cp.x < pp.x && cp.y < pp.y ) {
				setPosition( cp.y, cp.x )
				this.select( cpr.x, cpr.y )
			} else if ( cp.x < pp.x ) {
				setPosition( pp.y, cp.x )
				this.select( cpr.x, ppr.y )
			} else if ( cp.y < pp.y ) {
				setPosition( cp.y, pp.x )
				this.select( ppr.x, cpr.y )
			} else {
				setPosition( pp.y, pp.x )
				this.select( ppr.x, ppr.y )
			}
		} )
		.on( 'mouseup', () => {
			this.mousehold = false
			this.visible = false
		} )
	}

	doRectIntersect( r1, r2 ) {
		return !( r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top )
	}

	select( x, y ) {
		this._store.nodes.forEach( n => {
			// let nw = n._ngComponent.nodeBodyElem.width()
			// console.log( nw )
			let intersect = this.doRectIntersect(
				{ left: x,
					top: y,
					right: x + Math.abs( this.cpr.x - this.ppr.x ),
					bottom: y + Math.abs( this.cpr.y - this.ppr.y )
				},
				{ left: n.position.x,
					top: n.position.y,
					right: n._posRightRel,
					bottom: n._posBottomRel
				}
			)
			if ( intersect ) {
				n.multiSelected = true
			}
		} )
	}

	deselect() {
		this.ngs.clearSelectedNode()
		this._store.nodes.forEach( n => n.multiSelected = false )
	}

	getMousePositionRelativeToContainer( $event ) {
		let viewport = this.ngs.getViewportElem()
		, offset = viewport.offset()
		, zf = this._store.zoomFactor
		, mat = this.ngs.getNodeContainerTransformationMatrix()
		return {
			x: ( $event.clientX - offset.left + viewport.scrollLeft() - mat[ 4 ] ) / zf,
			y: ( $event.clientY - offset.top + viewport.scrollTop() - mat[ 5 ] ) / zf
		}
	}

}
