import { Injectable } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import $ from 'jquery'

@Injectable()
export class NodeGraphService {

	constructor() {
	}

	registerRenderer( renderer ) {
		this._store.renderer = renderer
	}

	registerViewportElem( viewportElem ) {
		this._store.viewportElem = $( viewportElem )
	}

	registerNodeContainerElem( containerElem ) {
		this._store.containerElem = $( containerElem )
	}

	registerCodeMirror( codeMirror ) {
		this._store.codeMirror = codeMirror
	}

	getViewportElem() {
		return this._store.viewportElem
	}

	getNodeContainerElem() {
		return this._store.containerElem
	}

	getNodeContainerTransformationMatrix() {
		return this._store.containerElem.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	getNodes() {
		return this._store.nodes
	}

	getConnections() {
		return this._store.connections
	}

	getSelectedNodes() {
		return this._store.selectedNodes
	}

	getMousePositionRelativeToContainer( $event ) {
		let viewport = this._store.viewportElem
		, offset = viewport.offset()
		, zf = this._store.zoomFactor
		, mat = this.getNodeContainerTransformationMatrix()
		return {
			x: ( $event.clientX - offset.left + viewport.scrollLeft() - mat[ 4 ] ) / zf,
			y: ( $event.clientY - offset.top + viewport.scrollTop() - mat[ 5 ] ) / zf
		}
	}

	setSelectedNode( node ) {
		if ( node ) node._markAsSelecting = true
		this._store.nodes.forEach( n => {
			let alreadySelected = this._store.selectedNodes.find( sn => sn === n )
			if ( n._markAsSelecting && !alreadySelected ) {
				this._store.selectedNodes.push( n )
				n._markAsSelecting = false
			}
		} )
		let selectedNodes = this.getSelectedNodes()
		if ( selectedNodes.length === 1 ) {
			this.setEditorText( selectedNodes[ 0 ]._fnstr )
		} else if ( selectedNodes.length > 1 ) {
			this.setEditorText( '<< MULTIPLE SELECTED >>' )
		} else {
			this.setEditorText( 'NULL' )
		}
	}

	isNodeInSelection( node ) {
		return this._store.selectedNodes.find( n => n === node ) !== undefined
	}

	setEditorText( text ) {
		this._store.codeMirror.doc.setValue( text )
		this._store.codeMirror.doc.clearHistory()
	}

	clearSelectedNode() {
		this._store.nodes.forEach( n => { n._markAsSelecting = false } )
		if ( this._store.selectedNodes.length !== 0 ) {
			this._store.selectedNodes = []
			this._store.codeMirror.doc.setValue( '' )
			this._store.codeMirror.doc.clearHistory()
		}
	}

	deleteIOByReference( io ) {
		this._reg.request( 'NodeConnection' ).disconnectIO( io )
		let node = this._store.nodes.find( node => !!node.input.find( inp => inp === io ) || !!node.output.find( opt => opt === io ) )
		node && node.deleteIO( io )
	}

	addNewNode( name ) {
		let n = new nodeFactory.Node( name )
		this._store.nodes.push( n )
	}

	deleteNode( node ) {
		for ( let io of [ ...node.output, ...node.input ] ) {
			this._reg.request( 'NodeConnection' ).disconnectIO( io )
		}
		this._store.nodes = this._store.nodes.filter( n => n !== node )
	}

	addNewIO( node, type, name ) {
		node[ [ 'addOutput', 'addInput' ][ type ] ]( name )
	}

	createTestNode() {
		let genID = () => String.fromCharCode( Math.floor( Math.random() * 23 ) + 65 ) + ~~( Math.random() * 9 )
		let n = new nodeFactory.Node( genID() )
		for ( let i = 0; i < ~~( Math.random() * 6 ); i ++ ) n.addInput( genID() )
		for ( let i = 0; i < ~~( Math.random() * 6 ); i ++ ) n.addOutput( genID() )
		this._store.nodes.push( n )
	}

}
