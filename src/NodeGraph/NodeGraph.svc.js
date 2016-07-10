import { Injectable, NgZone, ChangeDetectorRef } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import $ from 'jquery'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/keymap/vim.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Injectable()
export class NodeGraphService {

	constructor( zone: NgZone, changeDetectorRef: ChangeDetectorRef ) {
		console.log( 'NodeGraphService' )
		this.zone = zone
		this.changeDetectorRef = changeDetectorRef
		this.viewportElem = null
		this.containerElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.isConnecting = false
		this.selectedNode = null
		this.codeMirror = null
		this.zoomFactor = 1.0
		this.requestAnimationFrameId = null
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

	initEditor( textareaElem ) {
		let cm = this.codeMirror = CodeMirror.fromTextArea( textareaElem, {
			lineNumbers: true,
			mode: 'javascript',
			keyMap: 'vim',
			theme: 'black',
			tabSize: 2
		} )
		cm.setSize( '100%', 600 )
		cm.on( 'change', cm => {
			if ( !this.selectedNode ) return
			this.selectedNode._fnstr = cm.doc.getValue()
		} )
		window.CM = cm
		cm.constructor.Vim.map( 'jj', '<Esc>', 'insert' )
	}

	getNodes() { return this.nodes }

	getConnections() { return this.connections }

	getSelectedNode() { return this.selectedNode }

	setSelectedNode( node ) {
		this.selectedNode = node
		let swapIndex = this.nodes.findIndex( currentNode => currentNode === node )
		this.nodes.push( this.nodes.splice( swapIndex, 1 )[ 0 ] )
		this.codeMirror.doc.setValue( node._fnstr )
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
		function genID() {
			let id = String.fromCharCode( Math.floor( Math.random() * 23 ) + 65 ) + ~~( Math.random() * 9 )
			return id
		}
		let n = new nodeFactory.Node( genID() )
		let [ ilen, olen ] = [ ~~( Math.random() * 6 ), ~~( Math.random() * 6 ) ]
		for ( let i = 0; i < ilen; i ++ ) n.addInput( genID() )
		for ( let i = 0; i < olen; i ++ ) n.addOutput( genID() )
		this.nodes.push( n )
	}

}
