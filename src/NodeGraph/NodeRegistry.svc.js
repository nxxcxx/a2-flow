import { Injectable } from '@angular/core'
import { NodeStoreService } from 'src/NodeGraph/NodeStore.svc'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeEngineService } from 'src/NodeGraph/NodeEngine.svc'
import { NodeIMService } from 'src/NodeGraph/NodeIM.svc'
import { NodeConnectionService } from 'src/NodeGraph/NodeConnection.svc'

@Injectable()
export class NodeRegistryService {

	constructor(

		_NodeStoreService: NodeStoreService,
		_NodeGraphService: NodeGraphService,
		_NodeEngineService: NodeEngineService,
		_NodeIMService: NodeIMService,
		_NodeConnectionService: NodeConnectionService

	) {

		console.log( 'NodeRegistryService' )

		this._services = {}
		this.registerService( 'NodeStore', _NodeStoreService )
		this.registerService( 'NodeGraph', _NodeGraphService )
		this.registerService( 'NodeEngine', _NodeEngineService )
		this.registerService( 'NodeIM', _NodeIMService )
		this.registerService( 'NodeConnection', _NodeConnectionService )

	}

	registerService( name, service ) {
		this._services[ name ] = service
		service._reg = this
	}

	request( name ) {
		return this._services[ name ]
	}

}
