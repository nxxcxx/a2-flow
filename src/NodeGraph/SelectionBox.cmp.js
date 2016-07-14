import { Component } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
const html = String.raw

@Component( {

	selector: '[selectionBox]',
	template:
	html`
		<div
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

	constructor( _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
	}

	ngOnInit() {
		// TODO: fix selection box not moving when scrolling
		let viewport = this.ngs.getViewportElem()
		let setPosition = ( l, t ) => { [ this.left, this.top ] = [ l, t ] }
		viewport
			.on( 'mousedown', $event => {
				if ( $event.which !== 1 || $event.target !== this.ngs.getViewportElem()[ 0 ] ) return
				this.mousehold = true
				this.deselect()
				this.prevPos = { x: $event.clientX, y: $event.clientY }
				this.prevPosRel = this.ngs.getMousePositionRelativeToContainer( $event )
			} )
			.on( 'mousemove', $event => {
				if ( !this.mousehold ) return
				this.deselect()
				this.visible = true
				let [ cp, pp ] = [ { x: $event.clientX, y: $event.clientY }, this.prevPos ]
				, ppr = this.prevPosRel
				, cpr = this.cpr = this.ngs.getMousePositionRelativeToContainer( $event )
				this.width = Math.abs( cp.x - pp.x )
				this.height = Math.abs( cp.y - pp.y )
				if ( cp.x < pp.x && cp.y < pp.y ) {
					setPosition( cp.x, cp.y )
					this.select( cpr.x, cpr.y )
				} else if ( cp.x < pp.x ) {
					setPosition( cp.x, pp.y )
					this.select( cpr.x, ppr.y )
				} else if ( cp.y < pp.y ) {
					setPosition( pp.x, cp.y )
					this.select( ppr.x, cpr.y )
				} else {
					setPosition( pp.x, pp.y )
					this.select( ppr.x, ppr.y )
				}
			} )
			.on( 'mouseup', () => {
				this.mousehold = false
				this.visible = false
				this.ngs.setSelectedNode()
			} )
	}

	select( l, t ) {
		this._store.nodes.forEach( n => {
			if ( doRectIntersect( {
				l,
				t,
				r: l + Math.abs( this.cpr.x - this.prevPosRel.x ),
				b: t + Math.abs( this.cpr.y - this.prevPosRel.y )
			}, {
				l: n.position.x,
				t: n.position.y,
				r: n._posRightRel,
				b: n._posBottomRel
			} ) ) {
				n._markAsSelecting = true
			}
		} )
		function doRectIntersect( r1, r2 ) {
			return !( r2.l > r1.r || r2.r < r1.l || r2.t > r1.b || r2.b < r1.t )
		}
	}

	deselect() {
		this.ngs.clearSelectedNode()
	}

}
