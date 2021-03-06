import { Injectable } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import toposort from 'toposort'

@Injectable()
export class NodeConnectionService {

	constructor() {
		this._reg = null
	}

	isConnectionExists( output, input ) {
		return this._store.connections.find( io => io[ 0 ] === output && io[ 1 ] === input ) !== undefined
	}

	isValidConnection( output, input ) {
		return (
			output instanceof nodeFactory.Output &&
			input instanceof nodeFactory.Input &&
			output.parent.uuid !== input.parent.uuid &&
			!this.isConnectionExists( output, input ) &&
			!this.isConnectionCyclic( output, input )
		)
	}

	connectIO( output, input ) {
		if ( this.isValidConnection( output, input ) ) {
			this._disconnectInput( input )
			input.connect( output )
			this._store.connections.push( [ output, input ] )
		}
	}

	disconnectIO( io ) {
		if ( io instanceof nodeFactory.Input ) {
			this._disconnectInput( io )
		} else if ( io instanceof nodeFactory.Output ) {
			// need to make a new copy because input.disconnect mutate the array
			for ( let input of [ ...io.input ] ) {
				this._disconnectInput( input )
			}
		}
	}

	_disconnectInput( input ) {
		input.disconnect()
		this._store.connections = this._store.connections.filter( io => io[ 1 ] !== input )
	}

	startConnectingIO( io )  {
		this._store.connectingIO.src = io
		this._store.isConnecting = true
	}

	endConnectingIO( io ) {
		let cio = this._store.connectingIO
		cio.dst = io
		if ( cio.src instanceof nodeFactory.Output ) this.connectIO( cio.src, cio.dst )
		else if ( cio.src instanceof nodeFactory.Input ) this.connectIO( cio.dst, cio.src )
		cio.src = cio.dst = null
		this._store.isConnecting = false
	}

	isConnectionCyclic( output, input ) {
		let testCase = [ ...this._store.connections, [ output, input ] ]
		try { this.computeToposort( testCase ) }
		catch( ex ) { return true }
		return false
	}

	computeToposort( connections = this._store.connections ) {
		let edges = []
		connections.forEach( io => { edges.push( [ io[ 0 ].parent.uuid, io[ 1 ].parent.uuid ] ) } )
		return toposort( edges )
	}

}
