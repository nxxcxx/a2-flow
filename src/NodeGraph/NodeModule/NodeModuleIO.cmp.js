import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import NodeFactory from 'src/NodeGraph/NodeFactory'
import $ from 'jquery'

@Component( {

	selector: 'nodeModuleIO',
	styles: [ require( '!raw!sass!root/sass/NodeModuleIO.cmp.sass') ],
	template:
	`
	<div #ioRow class="ioRow">
		<div #ioPort class="ioPort"
			[ngClass]="{ ioActive: !io.free, ioDisabled: io.free, selected: isSelected(), deselected: !isSelected() }"
		></div>
		<div #ioLabel class="ioLabel">{{ io.name }}</div>
	</div>
	`

} )
export class NodeModuleIO {

	@Output() onConnecting = new EventEmitter()
	@Input() io
	@ViewChild( 'ioRow' ) ioRow
	@ViewChild( 'ioPort' ) ioPort
	@ViewChild( 'ioLabel' ) ioLabel

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngAfterViewInit() {
		let ioPort = this.ioPort = $( this.ioPort.nativeElement )
		, ioRow = $( this.ioRow.nativeElement )
		, ioLabel = $( this.ioLabel.nativeElement )
		if ( this.io instanceof NodeFactory.Input ) {
			ioRow.addClass( 'inputRow' )
			ioLabel.addClass( 'inputLabel' )
			ioPort.addClass( 'inputPort' )
		} else {
			ioRow.addClass( 'outputRow' )
			ioLabel.addClass( 'outputLabel' )
			ioPort.addClass( 'outputPort' )
		}
		this.mouseenterEvent = () => {
			if ( this.io.free ) ioPort.addClass( 'ioHover' )
		}
		this.mouseleaveEvent = () => {
			ioPort.removeClass( 'ioHover' )
		}
		this.mousedownEvent = () => {
			this.onConnecting.emit( true )
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

	updatePosition() {
		let [ hw, hh ] = [ this.ioPort.width() * 0.5, this.ioPort.height() * 0.5 ]
		, ioOffset = this.ioPort.offset()
		, viewport = this.ngs.getViewportElem()
		, viewportOffset = viewport.offset()
		, mat = this.ngs.getNodeContainerTransformationMatrix()
		this.io.position.x = ( ioOffset.left - viewportOffset.left + viewport.scrollLeft() + hw - mat[ 4 ] ) / mat[ 0 ]
		this.io.position.y = ( ioOffset.top - viewportOffset.top + viewport.scrollTop() + hh  - mat[ 5 ] ) / mat[ 0 ]
	}

	isSelected() {
		return this.io.parent === this.ngs.getSelectedNode()
	}

}
