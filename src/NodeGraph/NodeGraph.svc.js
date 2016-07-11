import { Injectable } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import $ from 'jquery'

@Injectable()
export class NodeGraphService {

	constructor() {
		console.log( 'NodeGraphService' )
		this.viewportElem = null
		this.containerElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.isConnecting = false
		this.selectedNode = null
		this.codeMirror = null
		this.zoomFactor = 1.0
		this.renderer = null
	}

	registerRenderer( renderer ) {
		this.renderer = renderer
	}

	registerViewportElem( viewportElem ) {
		this.viewportElem = $( viewportElem )
	}

	getViewportElem() {
		return this.viewportElem
	}

	setNodeContainerElem( containerElem ) {
		this.containerElem = $( containerElem )
	}

	getNodeContainerElem() {
		return this.containerElem
	}

	getNodeContainerTransformationMatrix() {
		return this.containerElem.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	registerCodeMirror( codeMirror ) {
		this.codeMirror = codeMirror
	}

	getNodes() {
		return this.nodes
	}

	getConnections() {
		return this.connections
	}

	getSelectedNode() {
		return this.selectedNode
	}

	setSelectedNode( node ) {
		this.selectedNode = node
		let swapIndex = this.nodes.findIndex( currentNode => currentNode === node )
		let lastIndex = this.nodes.length - 1
		;[ this.nodes[ swapIndex ], this.nodes[ lastIndex ] ] = [ this.nodes[ lastIndex ], this.nodes[ swapIndex ] ]
		this.codeMirror.doc.setValue( node._fnstr )
		this.codeMirror.doc.clearHistory()
	}

	clearSelectedNode() {
		this.selectedNode = null
	}

	deleteIOByReference( io ) {
		this.disconnectIO( io )
		let node = this.nodes.find( node => !!node.input.find( inp => inp === io ) || !!node.output.find( opt => opt === io ) )
		node && node.deleteIO( io )
	}

	addNewNode( name ) {
		let n = new nodeFactory.Node( name )
		this.nodes.push( n )
	}

	deleteNode( node ) {
		for ( let io of [ ...node.output, ...node.input ] ) {
			this.disconnectIO( io )
		}
		this.nodes = this.nodes.filter( n => n !== node )
	}

	addNewIO( node, type, name ) {
		let op = [ 'addOutput', 'addInput' ]
		node[ op[ type ] ]( name )
	}

	createTestNode() {
		let genID = () => String.fromCharCode( Math.floor( Math.random() * 23 ) + 65 ) + ~~( Math.random() * 9 )
		let n = new nodeFactory.Node( genID() )
		for ( let i = 0; i < ~~( Math.random() * 6 ); i ++ ) n.addInput( genID() )
		for ( let i = 0; i < ~~( Math.random() * 6 ); i ++ ) n.addOutput( genID() )
		this.nodes.push( n )
	}

}
