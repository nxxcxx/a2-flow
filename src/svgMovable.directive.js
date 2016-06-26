import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from 'angular2/core'
import { SvgUIService } from './svgUI.service'

@Directive( {

	selector: '[svgMovable]'

} )
export class SvgMovableDirective {

	@Input() targetId
	@Output() positionUpdated = new EventEmitter()

	constructor( elRef: ElementRef, svgUI: SvgUIService ) {
		this.el = elRef.nativeElement
		this.svgUI = svgUI
	}

	ngOnInit() {
		if ( this.targetId ) this.el = document.getElementById( this.targetId )
		if ( !this.el.hasAttribute( 'transform' ) ) {
			this.el.setAttribute( 'transform', 'matrix(1,0,0,1,0,0)' )
		}
		this.disabled = false
		this.dragging = false
		this.mousehold = false
		this.prevPos = { x: null, y: null }
		this.currPos = { x: null, y: null }
		this.mouseupEvent = () => {
			if ( this.disabled ) return
			this.mousehold = false
			this.dragging = false
		}
		this.mousemoveEvent = $event => {
			if ( this.disabled ) return
			if ( this.mousehold ) {
				this.dragging = true
				let currMouse = this.getMousePositionSVG( $event )
				, pm = this.prevMat
				, [ dx, dy ] = [ currMouse.x - this.prevMouse.x, currMouse.y - this.prevMouse.y ]
				, [ nx, ny ] = [ pm[ 4 ] + dx, pm[ 5 ] + dy ]
				this.el.setAttribute( 'transform', `matrix(${pm[0]},${pm[1]},${pm[2]},${pm[3]},${nx},${ny})` )
				this.positionUpdated.emit( { x: nx, y: ny } )
			}
		}
	}

	ngAfterViewInit() {
		setTimeout( () => {
			this.svgUI.addEventListener( 'mouseup', this.mouseupEvent )
			this.svgUI.addEventListener( 'mousemove', this.mousemoveEvent)
		}, 0 )
	}

	ngOnDestroy() {
		// detatch event listener that is not bound using @HostListener to prevent memory leak
		this.svgUI.removeEventListener( 'mouseup', this.mouseupEvent )
		this.svgUI.removeEventListener( 'mousemove', this.mousemoveEvent )
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		// disable if elem has attr svg-disable-move
		if ( this.disabled || $event.target.hasAttribute( 'svg-disable-move' ) ) return
		this.mousehold = true
		this.prevMat = this.parseMatrix()
		this.prevMouse = this.getMousePositionSVG( $event )
	}

	parseMatrix() {
		return this.el.getAttribute( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	getMousePositionSVG( $event ) {
		// return relative mouse position in SVG element
		// if the elem to move is the viewport, dont apply any transformation
		if ( this.el === this.svgUI.getViewport() ) {
			return { x: $event.clientX, y: $event.clientY }
		}
		return this.svgUI.getMousePositionSVG( $event )
	}

}
