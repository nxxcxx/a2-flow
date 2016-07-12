import { Injectable } from '@angular/core'
import { NodeStoreService } from 'src/NodeGraph/NodeStore.svc'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeEngineService } from 'src/NodeGraph/NodeEngine.svc'
import { NodeIEService } from 'src/NodeGraph/NodeIE.svc'
import { NodeConnectionService } from 'src/NodeGraph/NodeConnection.svc'

@Injectable()
export class NodeRegistryService {

	constructor(

		_NodeStoreService: NodeStoreService,
		_NodeGraphService: NodeGraphService,
		_NodeEngineService: NodeEngineService,
		_NodeIEService: NodeIEService,
		_NodeConnectionService: NodeConnectionService

	) {

		this.registerServices( _NodeStoreService, {
			NodeGraph: _NodeGraphService,
			NodeEngine: _NodeEngineService,
			NodeIE: _NodeIEService,
			NodeConnection: _NodeConnectionService
		} )

	}

	registerServices( store = null, services = {} ) {
		this._store = store
		this._services = {}
		for ( let [ name, svc ] of Object.entries( services ) ) {
			this._services[ name ] = svc
			svc._reg = this
			svc._store = store
		}
	}

	request( name ) {
		return this._services[ name ]
	}

}
