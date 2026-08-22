/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.js';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import './minimalEditorMenus.contribution.js';

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);

configurationRegistry.registerDefaultConfigurations([{
	overrides: {
		'workbench.activityBar.location': 'hide',
		'workbench.panel.opensMaximized': 'never',
		'workbench.statusBar.visible': true,
		'workbench.editor.showTabs': 'single',
		'workbench.startupEditor': 'none',
		'workbench.enableExperiments': false,
		'telemetry.telemetryLevel': 'off',
		'files.simpleDialog.enable': true,
		'workbench.colorTheme': 'Just Black',
	}
}]);
