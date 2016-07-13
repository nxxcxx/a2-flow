import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
const html = String.raw

@Component( {

	selector: '[nodeConnection]',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template:
	html`
		<svg:path
			(dblclick)="disconnect()"
			[attr.d]="getBezierCurveString()"
			[attr.stroke]="getStokeColor()"
			stroke-width="1.5" fill="rgba(0,0,0,0)"
			style="pointer-events: auto"
		/>
	`

} )
export class NodeConnection {

	@Input() selectedNode
	@Input() connection
	@Input() x1
	@Input() y1
	@Input() x2
	@Input() y2

	constructor( _reg: NodeRegistryService ) {
		this.ncs = _reg.request( 'NodeConnection' )
	}

	getBezierCurveString() {
		let [ x1, y1, x2, y2 ] = [ this.x1, this.y1, this.x2, this.y2 ].map( v => +v.toFixed( 2 ) )
		, hf = Math.abs( x1 - x2 ) * 0.5
		, [ cx1, cx2 ] = [ x1 + hf, x2 - hf ].map( v => +v.toFixed( 2 ) )
		return `M${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
	}

	getStokeColor() {
		// if ( !!this.selectedNode &&
		// 		(
		// 			!!this.selectedNode.output.find( opt => opt === this.connection[ 0 ] ) ||
		// 			!!this.selectedNode.input.find( inp => inp === this.connection[ 1 ] )
		// 		)
		// ) return '#0bb1f9'
		return '#e6e6e6'
	}

	disconnect() {
		this.ncs.disconnectIO( this.connection[ 1 ] )
	}

}
