import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import NodeFactory from 'src/NodeGraph/NodeFactory'
import $ from 'jquery'

@Component( {

	selector: 'nodeModuleIO',
	styles: [ require( '!raw!sass!root/sass/NodeModuleIO.cmp.sass') ],
	template:
	`
	<div #ioRow class="ioRow" [ngClass]="{ inputRow: isInput, outputRow: isOutput }">

		<div #ioPort class="ioPort"
			[ngClass]="{
				ioActive: !io.free, ioDisabled: io.free,
				selected: isSelected(), deselected: !isSelected(),
				inputPort: isInput, outputPort: isOutput,
				ioHover: mousehover
			}"
		></div>

		<div #ioLabel class="ioLabel"
			[ngClass]="{ inputLabel: isInput, outputLabel: isOutput }"
		>{{ io.name }}</div>

	</div>
	`

} )
export class NodeModuleIO {

	@Output() onConnecting = new EventEmitter()
	@Input() io
	@ViewChild( 'ioPort' ) ioPort

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngOnInit() {
		this.isInput = this.io instanceof NodeFactory.Input
		this.isOutput = this.io instanceof NodeFactory.Output
	}

	ngAfterViewInit() {
		let ioPort = this.ioPort = $( this.ioPort.nativeElement )
		this.mouseenterEvent = () => {
			this.mousehover = true
		}
		this.mouseleaveEvent = () => {
			this.mousehover = false
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
