import { Component, Input, Output, EventEmitter, ViewChild } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import NodeFactory from 'src/NodeGraph/NodeFactory'

import $ from 'jquery'

@Component( {

	selector: 'nodeModuleIO',
	template:
	`
	<div #ioRow style="display: flex">
		<div #ioPort style="width: 10px; height: 10px; align-self: center;"
			[ngStyle]="{ background: io.free ? 'rgba(0,0,0,0)' : '#e6e6e6' }"
		>
		</div>
		<div #ioLabel style="align-self: center">{{ io.name }}</div>
	</div>
	`

} )
export class NodeModuleIO {

	@Output() onLink = new EventEmitter()
	@Input() io
	@ViewChild( 'ioRow' ) ioRow
	@ViewChild( 'ioPort' ) ioPort
	@ViewChild( 'ioLabel' ) ioLabel

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngAfterViewInit() {
		let ioPort = $( this.ioPort.nativeElement )
		let ioRow = $( this.ioRow.nativeElement )
		let ioLabel = $( this.ioLabel.nativeElement )
		// TODO: use angular component css metadata
		if ( this.io instanceof NodeFactory.Input ) {
			ioRow.css( 'flex-direction', 'row' )
			ioLabel.css( 'margin-left', '10px' )
			ioPort.css( 'border', '1px solid #5d5d5d')
			ioPort.css( 'border-left', '0px')
		} else {
			ioRow.css( 'flex-direction', 'row-reverse' )
			ioLabel.css( 'margin-right', '10px' )
			ioPort.css( 'border', '1px solid #5d5d5d')
			ioPort.css( 'border-right', '0px')
		}
		this.mouseenterEvent = () => {
			if ( this.io.free ) ioPort.css( 'background', '#e6e6e6' )
		}
		this.mouseleaveEvent = () => {
			if ( this.io.free ) ioPort.css( 'background', 'rgba(0,0,0,0)' )
		}
		this.mousedownEvent = () => {
			this.onLink.emit( true )
			this.ngs.startConnectingIO( this.io )
		}
		this.mouseupEvent = () => {
			this.ngs.endConnectingIO( this.io )
		}
		this.dblclickEvent = () => {
			this.ngs.disconnectIO( this.io )
		}
		ioPort.on( 'mouseenter', this.mouseenterEvent )
		.on( 'mouseleave', this.mouseleaveEvent )
		.on( 'mousedown', this.mousedownEvent )
		.on( 'mouseup', this.mouseupEvent )
		.on( 'dblclick', this.dblclickEvent )
	}

	ngOnDestroy() {
		let ioPort = $( this.ioPort.nativeElement )
		ioPort.off( 'mouseenter', this.mouseenterEvent )
		.off( 'mouseleave', this.mouseleaveEvent )
		.off( 'mousedown', this.mousedownEvent )
		.off( 'mouseup', this.mouseupEvent )
		.off( 'dblclick', this.dblclickEvent )
	}

	updatePosition() {
		// TODO: nodeContainer thru service
		let ioPort = $( this.ioPort.nativeElement )
		let hw = ioPort.width() * 0.5
		let hh = ioPort.height() * 0.5
		let ioOffset = ioPort.offset()
		let viewport = this.ngs.getContainerElem()
		let viewportOffset = viewport.offset()
		let zf = this.ngs.zoomFactor

		// TODO: no ID selector
		let mat = $( '#nodeGraphContainer' ).css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
		this.io.ui.absolutePosition.x = ( ioOffset.left - viewportOffset.left + viewport.scrollLeft() + hw - mat[ 4 ] ) / zf
		this.io.ui.absolutePosition.y = ( ioOffset.top - viewportOffset.top + viewport.scrollTop() + hh  - mat[ 5 ] ) / zf
	}

}
