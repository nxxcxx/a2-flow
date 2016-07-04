import { Component, Input } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: '[nodeConnection]',
	template:
	`
		<svg:path
			[attr.d]="getBezierCurveString()"
			(dblclick)="disconnect()"
			stroke-width="1" stroke="#e6e6e6" fill="rgba(0,0,0,0)"
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
		let x1 = this.connection[ 0 ].ui.absolutePosition.x
		, y1 = this.connection[ 0 ].ui.absolutePosition.y
		, x2 = this.connection[ 1 ].ui.absolutePosition.x
		, y2 = this.connection[ 1 ].ui.absolutePosition.y
		, hf = Math.abs( x1 - x2 ) * 0.5
		, cx1 = x1 + hf
		, cx2 = x2 - hf
		return `M${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
	}

	disconnect() {
		this.ngs.disconnectIO( this.connection[ 1 ] )
	}

}
