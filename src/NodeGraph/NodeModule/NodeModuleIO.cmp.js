import { Component, Input, Output, EventEmitter, ViewChild } from 'angular2/core'
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
		let ioPort = $( this.ioPort.nativeElement )
		let hw = ioPort.width() * 0.5
		let hh = ioPort.height() * 0.5
		let ioOffset = ioPort.offset()
		let viewport = this.ngs.getViewportElem()
		let viewportOffset = viewport.offset()
		let zf = this.ngs.zoomFactor
		let mat = this.ngs.getNodeContainerTransformationMatrix()
		this.io.ui.absolutePosition.x = ( ioOffset.left - viewportOffset.left + viewport.scrollLeft() + hw - mat[ 4 ] ) / zf
		this.io.ui.absolutePosition.y = ( ioOffset.top - viewportOffset.top + viewport.scrollTop() + hh  - mat[ 5 ] ) / zf
	}

	isSelected() {
		return this.io.parent === this.ngs.getSelectedNode()
	}

}
