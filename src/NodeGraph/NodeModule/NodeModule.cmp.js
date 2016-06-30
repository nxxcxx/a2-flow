import { Component, Input, ViewChild, ViewChildren } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'

import $ from 'jquery'

@Component( {

	selector: 'nodeModule',
	directives: [ NodeModuleIO ],
	template:
	`
	<div #nodeElem style="position: absolute; padding: 4px 0px 4px 0px; background: rgb(24,26,28); border: 1px solid #5d5d5d">

		<div #headerElem style="margin: 0px 5px 0px 5px">
			{{ node.name }} {{ node.order }}
		</div>

		<div #ioContainer style="background: rgba(255,127,0,0); padding: 0px;">

			<div #inputColumn style="background: rgba(255,0,0,0); padding: 0px; float: left; display: inline-block">
				<nodeModuleIO *ngFor="let input of node.input" [io]="input" (onLink)="onLink( $event )"></nodeModuleIO>
			</div>

			<div #separator style="background: rgba(0,255,0,0); width: 8px; display: inline-block"></div>

			<div #outputColumn style="background: rgba(0,0,255,0); padding: 0px; float: right; display: inline-block">
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
		// this.node.setAngularComponent( this )
	}

	ngAfterViewInit() {
		this.nodeElem = $( this.nodeElem.nativeElement )
		this.mousedownEvent = $event => {
			this.ngs.setSelectedNode( this.node )
			this.mousehold = true
			this.prevMouse = { x: $event.pageX, y: $event.pageY }
			this.prevPos = this.nodeElem.position() // TODO:
		}
		this.mouseupEvent = () => {
			this.mousehold = false
			this.disableMove = false
		}
		this.mousemoveEvent = $event => {
			if ( this.disableMove ) return
			if ( this.mousehold ) {
				// TODO: multiple selection
				// if select multiple, trigger the events to all selected node
				// this.ngs.getAllSelectedNodes().forEach( node => node.getAngularComponent().trigger( 'evt', fn ) )
				let [ dx, dy ] = [ $event.pageX - this.prevMouse.x, $event.pageY - this.prevMouse.y ]
				let zf = this.ngs.zoomFactor
				this.nodeElem.css( { left: ( this.prevPos.left + dx ) / zf, top: ( this.prevPos.top + dy ) / zf } )
				this.updatePositionIO()
			}
		}
		this.updatePositionIO()
		this.nodeElem.on( 'mousedown', this.mousedownEvent )
		this.ngs.getContainerElem()
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	ngOnDestroy() {
		this.nodeElem.off( 'mousedown', this.mousedownEvent )
		this.ngs.getContainerElem()
		.off( 'mouseup', this.mouseupEvent )
		.off( 'mousemove', this.mousemoveEvent )
	}

	updatePositionIO() {
		this.nodeIO.toArray().forEach( io => io.updatePosition() )
	}

	onLink( bool ) {
		this.disableMove = bool
	}

}
