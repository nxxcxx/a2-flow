import { Component, ViewChild } from '@angular/core'

@Component( {

	selector: 'nodeStats',
	template:
	`
		<div style="position: fixed; bottom: 0px; left: 0px; z-index: 10000">
			<canvas #canvas></canvas>
		</div>
	`

} )
export class NodeStats {

	@ViewChild( 'canvas' ) canvas

	constructor() {
		this.beginTime = ( performance || Date ).now()
		this.prevTime = this.beginTime
		this.frames = 0
		this.fps = 0
		this.bg = '#000'
		this.fg = '#fff'
		window.STATS = this
		this.width = 200
		this.height = 50
		this.prevY = 0
	}

	ngOnInit() {
		let canvas = this.canvas.nativeElement
		canvas.width = this.width
		canvas.height = this.height
		let ctx = this.ctx = canvas.getContext( '2d' )
		ctx.imageSmoothingEnabled = false
		ctx.fillStyle = this.bg
		ctx.fillRect( 0, 0, this.width, this.height )
	}

	begin() {
		this.beginTime = ( performance || Date ).now()
	}

	end() {
		this.frames ++
		let time = ( performance || Date ).now()
		let updateInterval = 100
		if ( time > this.prevTime + updateInterval ) {
			this.updateFPS( ( this.frames * 1000 ) / ( time - this.prevTime ), 120 )
			this.prevTime = time
			this.frames = 0
		}
		return time
	}

	updateFPS( value, maxValue ) {
		let ctx = this.ctx
		let k = 1
		ctx.drawImage( this.canvas.nativeElement, k, 0, this.width - k, this.height, 0, 0, this.width - k, this.height )
		let clampMaxGraphHeight = 60
		let y = this.height - Math.round( ( Math.min( value, clampMaxGraphHeight ) / maxValue ) * this.height )

		ctx.strokeStyle = this.bg
		ctx.fillStyle = this.bg
		ctx.fillRect( this.width - 1, 0, 1, this.height )

		ctx.strokeStyle = this.fg
		ctx.beginPath()
		ctx.moveTo( this.width - 1, this.prevY )
		ctx.lineTo( this.width , y )
		ctx.closePath()
		ctx.stroke()

		this.prevY = y
	}


}
