import { Injectable } from 'angular2/core'
import * as nodeFactory from './nodeFactory'

@Injectable()
export class NodeManager {

	constructor() {
		this.nodes = []
		this.createTestNode()
	}

	addNode() {
		this.nodes.push( Math.random() )
	}

	removeNode() {
		this.nodes.pop()
	}

	getNodes() {
		return this.nodes
	}

	createTestNode() {
		var n = nodeFactory.create( 'Vector3' )
		n.addInput( 'bufferGeometry', 'shader', 'modifier' )
		n.addOutput( 'vec3', 'buffer' )
		n._fnstr = ''
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'BufferGeometry' )
		n.addInput( 'geometry', 'shader', 'buffer' )
		n.addOutput( 'Mesh', 'shader' )
		n._fnstr = ''
		n.compile()
		this.nodes.push( n )
	}

}
