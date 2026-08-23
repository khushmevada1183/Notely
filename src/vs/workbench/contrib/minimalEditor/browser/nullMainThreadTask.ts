/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import * as tasks from '../../../services/tasks/common/tasks.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { MainContext, MainThreadTaskShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadTask)
export class NullMainThreadTask extends Disposable implements MainThreadTaskShape {

	$createTaskId(_task: tasks.ITaskDTO): Promise<string> { return Promise.resolve(''); }
	$registerTaskProvider(_handle: number, _type: string): Promise<void> { return Promise.resolve(); }
	$unregisterTaskProvider(_handle: number): Promise<void> { return Promise.resolve(); }
	$fetchTasks(_filter?: tasks.ITaskFilterDTO): Promise<tasks.ITaskDTO[]> { return Promise.resolve([]); }
	$getTaskExecution(_value: tasks.ITaskHandleDTO | tasks.ITaskDTO): Promise<tasks.ITaskExecutionDTO> { return Promise.resolve({ id: '', task: undefined! }); }
	$executeTask(_task: tasks.ITaskHandleDTO | tasks.ITaskDTO): Promise<tasks.ITaskExecutionDTO> { return Promise.resolve({ id: '', task: undefined! }); }
	$terminateTask(_id: string): Promise<void> { return Promise.resolve(); }
	$registerTaskSystem(_scheme: string, _info: tasks.ITaskSystemInfoDTO): void { }
	$customExecutionComplete(_id: string, _result?: number): Promise<void> { return Promise.resolve(); }
	$registerSupportedExecutions(_custom?: boolean, _shell?: boolean, _process?: boolean): Promise<void> { return Promise.resolve(); }
}
