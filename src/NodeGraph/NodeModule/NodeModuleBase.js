import { Input, ViewChild, ViewChildren, ElementRef, HostListener } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'
import $ from 'jquery'

export class NodeModuleBase {

	@Input() node
	@ViewChildren( NodeModuleIO ) nodeIO
	@ViewChild( 'nodeBody' ) nodeBody

	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.el = elRef.nativeElement
		this.nodeElem = $( this.el )
		this.disableMove = false
		this.resetPrevPos()
	}

	ngOnInit() {
		this.node._ngComponent = this
	}

	ngAfterViewInit() {
		this.moveByPixel( this.node.position.x, this.node.position.y )
		this.resetPrevPos()
		this.updateIOPosition()
		this.mouseupEvent = () => {
			this.mousehold = false
			this.moveDisabled = false
			this.ngs.getSelectedNodes()
				.filter( n => n !== this.node )
				.map( n => n._ngComponent.resetPrevPos() )
		}
		this.mousemoveEvent = $event => {
			if ( !this.mousehold || this.moveDisabled ) return
			let [ dx, dy ] = [ $event.pageX - this.prevMouse.x, $event.pageY - this.prevMouse.y ]
			this.moveByPixel( dx, dy )
			this.ngs.getSelectedNodes()
				.filter( n => n !== this.node )
				.map( n => n._ngComponent.moveByPixel( dx, dy ) )
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

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		if ( !this.ngs.isNodeInSelection( this.node ) ) {
			this.ngs.clearSelectedNode()
			this.ngs.setSelectedNode( this.node )
		}
		this.mousehold = true
		this.prevMouse = { x: $event.pageX, y: $event.pageY }
		this.resetPrevPos()
	}

	resetPrevPos() {
		this.prevPos = this.nodeElem.position()
	}

	setPosition( x, y ) {
		this.node.position = { x, y }
		this.nodeElem.css( 'transform', `matrix(1,0,0,1,${x},${y})` )
	}

	moveByPixel( dx, dy ) {
		let zf = this._store.zoomFactor
		, [ x, y ] = [ ( this.prevPos.left + dx ) / zf, ( this.prevPos.top + dy ) / zf ].map( v => +v.toFixed( 2 ) )
		this.setPosition( x, y )
		this.updateIOPosition()
		// TODO: cleanup relative width/height
		let nodeBody = $( this.nodeBody.nativeElement )
		this.node._posRightRel = ( this.nodeElem.position().left + nodeBody.width() ) / zf
		this.node._posBottomRel = ( this.nodeElem.position().top + nodeBody.height() ) / zf
	}

	updateIOPosition() {
		this.nodeIO.toArray().forEach( io => io.updatePosition() )
	}

	onConnecting( bool ) {
		this.moveDisabled = bool
	}

	shouldHighlight() {
		return this.ngs.isNodeInSelection( this.node ) || this.node._markAsSelecting
	}

}
