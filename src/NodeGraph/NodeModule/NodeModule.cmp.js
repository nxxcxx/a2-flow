import { Component, Input, ViewChild, ViewChildren } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'
import $ from 'jquery'

@Component( {

	selector: 'nodeModule',
	directives: [ NodeModuleIO ],
	styles: [ require( '!raw!sass!root/sass/NodeModule.cmp.sass') ],
	template:
	`
	<div #nodeElem class="nodeElem" [ngClass]="{selected: isSelected(), deselected: !isSelected()}">

		<div #headerElem class="headerElem">
			{{ node.name }} {{ node.order }}
		</div>

		<div #ioContainer class="ioContainer">

			<div #inputColumn class="inputColumn">
				<nodeModuleIO *ngFor="let input of node.input" [io]="input" (onLink)="onLink( $event )"></nodeModuleIO>
			</div>

			<div #separator class="separator"></div>

			<div #outputColumn class="outputColumn">
				<nodeModuleIO *ngFor="let output of node.output" [io]="output" (onLink)="onLink( $event )"></nodeModuleIO>
			</div>

		</div>

	</div>
	`

} )
export class NodeModule {

	@Input() node
	@ViewChild( 'nodeElem' ) nodeElem
	@ViewChildren( NodeModuleIO ) nodeIO

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.disableMove = false
	}

	ngOnInit() {
		// TODO: this.node.setAngularComponent( this )
	}

	ngAfterViewInit() {
		this.nodeElem = $( this.nodeElem.nativeElement )
		this.mousedownEvent = $event => {
			this.ngs.setSelectedNode( this.node )
			this.mousehold = true
			this.prevMouse = { x: $event.pageX, y: $event.pageY }
			this.prevPos = this.nodeElem.position() // TODO: ?
		}
		this.mouseupEvent = () => {
			this.mousehold = false
			this.disableMove = false
		}
		this.mousemoveEvent = $event => {
			if ( !this.mousehold || this.disableMove ) return
			// TODO: multiple selection
			// if select multiple, trigger the events to all selected node
			// this.ngs.getAllSelectedNodes().forEach( node => node.getAngularComponent().trigger( 'evt', fn ) )
			let [ dx, dy ] = [ $event.pageX - this.prevMouse.x, $event.pageY - this.prevMouse.y ]
			let zf = this.ngs.zoomFactor
			this.nodeElem.css( { left: ( this.prevPos.left + dx ) / zf, top: ( this.prevPos.top + dy ) / zf } )
			this.updatePositionIO()
		}
		this.updatePositionIO()
		this.nodeElem.on( 'mousedown', this.mousedownEvent )
		this.ngs.getViewportElem()
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	updatePositionIO() {
		this.nodeIO.toArray().forEach( io => io.updatePosition() )
	}

	onLink( bool ) {
		this.disableMove = bool
	}

	isSelected() {
		return this.node === this.ngs.getSelectedNode()
	}

}
