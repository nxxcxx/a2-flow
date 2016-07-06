import { Component, Input } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: '[nodeConnection]',
	template:
	`
		<svg:path
			[attr.d]="getBezierCurveString()"
			[attr.stroke]="getStokeColor()"
			(dblclick)="disconnect()"
			stroke-width="1" fill="rgba(0,0,0,0)"
		/>
	`

} )
export class NodeConnection {

	@Input() connection

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	getBezierCurveString() {
		// TODO: optimize this fn
		let x1 = this.connection[ 0 ].position.x
		, y1 = this.connection[ 0 ].position.y
		, x2 = this.connection[ 1 ].position.x
		, y2 = this.connection[ 1 ].position.y
		, hf = Math.abs( x1 - x2 ) * 0.5
		, cx1 = x1 + hf
		, cx2 = x2 - hf
		return `M${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
	}

	getStokeColor() {
		let node = this.ngs.getSelectedNode()
		if ( !!node &&
			( !!node.output.find( opt => opt === this.connection[ 0 ] ) ||
			!!node.input.find( inp => inp === this.connection[ 1 ] ) )
		) return '#0bb1f9'
		return '#e6e6e6'
	}

	disconnect() {
		this.ngs.disconnectIO( this.connection[ 1 ] )
	}

}
