import { Directive, ElementRef, HostListener, Input } from 'angular2/core'
import { SvgUIService } from './svgUI.service'

@Directive( {

	selector: '[svgMovable]'

} )
export class SvgMovableDirective {

	@Input() targetId
	@Input() isRootCtrl // isRootCtrl indicate elem root transformation ( scalingFactor must equal to 1 )


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

		this.numPattern = /[\d|\.|\+|-]+/g
		this.mat = this.el.getAttribute( 'transform' ).match( this.numPattern ).map( v => parseFloat( v ) )

		this.position = { x: 0, y: 0 }
		this.position.x = this.mat[ 4 ]
		this.position.y = this.mat[ 5 ]

		this.mouseupEvent = () => {
			if ( this.disabled ) return
			this.mousehold = false
		}

		this.mousemoveEvent = $event => {
			if ( this.disabled ) return
			if ( this.mousehold ) {
				this.dragging = true
				this.currPos.x = $event.pageX
				this.currPos.y = $event.pageY
				let sf = this.isRootCtrl ? 1.0 : this.svgUI.getScalingFactor()
				, dx = ( this.currPos.x - this.prevPos.x ) / sf
				, dy = ( this.currPos.y - this.prevPos.y ) / sf
				, newX = this.mat[ 4 ] + dx
				, newY = this.mat[ 5 ] + dy
				, mat = this.mat
				this.el.setAttribute( 'transform', `matrix(${mat[0]},${mat[1]},${mat[2]},${mat[3]},${newX},${newY})` )
			}
		}

		document.addEventListener( 'mouseup', this.mouseupEvent )
		document.addEventListener( 'mousemove', this.mousemoveEvent)

	}

	ngOnDestroy() {
		// TODO: attach event to svgCanvas insted of document
		// detatch event listener that is not bound using @HostListener to prevent memory leak
		document.removeEventListener( 'mouseup', this.mouseupEvent )
		document.removeEventListener( 'mousemove', this.mousemoveEvent )
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {

		if ( this.disabled ) return
		this.mousehold = true
		this.prevPos.x = $event.pageX
		this.prevPos.y = $event.pageY
		this.mat = this.el.getAttribute( 'transform' ).match( this.numPattern ).map( v => parseFloat( v ) )

	}

}
