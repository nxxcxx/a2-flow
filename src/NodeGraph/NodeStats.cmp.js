import { Component, ViewChild } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
const html = String.raw

@Component( {

	selector: 'nodeStats',
	template:
	html`
		<div style="position: fixed; top: 0px; left: 30%; z-index: 10;">
			<div #fps style="position: absolute; top: 1px; right: 1px; font-size: 10px"></div>
			<canvas #canvas></canvas>
		</div>
	`

} )
export class NodeStats {

	@ViewChild( 'canvas' ) canvas
	@ViewChild( 'fps' ) fps

	constructor( _reg: NodeRegistryService ) {
		this.beginTime = ( performance || Date ).now()
		this.prevTime = this.beginTime
		this.frames = 0
		this.bg = '#181a1c'
		this.fg = '#eee'
		this.width = 80
		this.height = 40
		this.prevY = this.height
		this.clampMaxGraphHeight = 60
		this.updateInterval = 100
		_reg._store.stats = this
	}

	ngOnInit() {
		this.fpsElem = this.fps.nativeElement
		let canvas = this.canvas.nativeElement
		canvas.width = this.width
		canvas.height = this.height
		let ctx = this.ctx = canvas.getContext( '2d' )
		ctx.fillStyle = this.bg
		ctx.fillRect( 0, 0, this.width, this.height )
	}

	begin() {
		this.beginTime = ( performance || Date ).now()
	}

	end() {
		this.frames ++
		let time = ( performance || Date ).now()
		if ( time > this.prevTime + this.updateInterval ) {
			this.drawGraphSegment( ( this.frames * 1000 ) / ( time - this.prevTime ), 100 )
			this.prevTime = time
			this.frames = 0
		}
		return time
	}

	drawGraphSegment( value, maxValue ) {
		let ctx = this.ctx
		, fps = Math.round( value )
		, y = this.height - Math.round( ( Math.min( value, this.clampMaxGraphHeight ) / maxValue ) * this.height )
		, unit = 1
		, offsetTop = 0
		ctx.drawImage( this.canvas.nativeElement,
			unit, offsetTop, this.width - unit, this.height - offsetTop,
			0, offsetTop, this.width - unit, this.height - offsetTop
		)

		ctx.fillStyle = this.bg
		ctx.fillRect( this.width - 1, 0, 1, this.height )

		ctx.strokeStyle = this.fg
		ctx.beginPath()
		ctx.moveTo( this.width - 1, this.prevY )
		ctx.lineTo( this.width, y )
		ctx.closePath()
		ctx.stroke()

		this.fpsElem.innerText = fps

		this.prevY = y

	}


}
