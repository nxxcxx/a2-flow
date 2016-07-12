import { Component, Input, ViewChildren, ElementRef, HostListener } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'
import $ from 'jquery'
let html = String.raw

@Component( {

	selector: '[nodeModule]',
	directives: [ NodeModuleIO ],
	styles: [ require( '!raw!sass!root/sass/NodeModule.cmp.sass') ],
	template:
	html`
		<div class="nodeElem" [ngClass]="{selected: isSelected(), deselected: !isSelected()}" >

			<div #headerElem class="headerElem">
				{{ node.name }}
			</div>

			<div #ioContainer class="ioContainer">

				<div #inputColumn class="inputColumn">
					<div nodeModuleIO *ngFor="let input of node.input" [io]="input" (onConnecting)="onConnecting( $event )"></div>
				</div>

				<div #separator class="separator"></div>

				<div #outputColumn class="outputColumn">
					<div nodeModuleIO *ngFor="let output of node.output" [io]="output" (onConnecting)="onConnecting( $event )"></div>
				</div>

			</div>

		</div>
	`

} )
export class NodeModule {

	@Input() node
	@ViewChildren( NodeModuleIO ) nodeIO

	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.el = elRef.nativeElement
		this.nodeElem = $( this.el )
		this.disableMove = false
		this.prevPos = this.nodeElem.position()
		// TODO: this.node.setAngularComponent( this )
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		this.ngs.setSelectedNode( this.node )
		this.mousehold = true
		this.prevMouse = { x: $event.pageX, y: $event.pageY }
		this.prevPos = this.nodeElem.position()
	}

	ngAfterViewInit() {
		this.moveByPixel( this.node.position.x, this.node.position.y )
		this.updatePositionIO()
		this.mouseupEvent = () => {
			this.mousehold = false
			this.disableMove = false
		}
		this.mousemoveEvent = $event => {
			if ( !this.mousehold || this.disableMove ) return
			// TODO: multiple selection
			// if select multiple, trigger the events to all selected node
			// getAllSelectedNodes().forEach( node => node.getAngularComponent().moveByPixel( dx, dy ) )
			let [ dx, dy ] = [ $event.pageX - this.prevMouse.x, $event.pageY - this.prevMouse.y ]
			this.moveByPixel( dx, dy )
		}
		this.ngs.getViewportElem()
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	ngOnDestroy() {
		this.ngs.getViewportElem()
		.off( 'mouseup', this.mouseupEvent )
		.off( 'mousemove', this.mousemoveEvent )
	}

	moveByPixel( dx, dy ) {
		let zf = this._store.zoomFactor
		, [ xx, yy ] = [ ( this.prevPos.left + dx ) / zf, ( this.prevPos.top + dy ) / zf ]
		this.nodeElem.css( 'transform', `matrix(1,0,0,1,${xx},${yy})` )
		this.node.position.x = xx
		this.node.position.y = yy
		this.updatePositionIO()
	}

	updatePositionIO() {
		this.nodeIO.toArray().forEach( io => io.updatePosition() )
	}

	onConnecting( bool ) {
		this.disableMove = bool
	}

	isSelected() {
		return this.node === this.ngs.getSelectedNode()
	}

}
