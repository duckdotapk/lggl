//
// Imports
//

import { DE } from "@donutteam/document-builder";
import * as Fritter from "@donutteam/fritter";

//
// Types
//

export type ComponentFunction<ComponentFunctionOptions> = (options: ComponentFunctionOptions) => DE;

export type GetOptionsFunction<ComponentFunctionOptions, BaseFritterContext extends Fritter.FritterContext = Fritter.FritterContext> =
	(
		context : MiddlewareFritterContext<ComponentFunctionOptions, BaseFritterContext>,
		options : Partial<ComponentFunctionOptions>,
	) => ComponentFunctionOptions;

export type RenderComponentFunction<ComponentFunctionOptions> = (options: Partial<ComponentFunctionOptions>) => void;

//
// Middleware
//

export type MiddlewareFritterContext<RenderComponentOptions, BaseFritterContext extends Fritter.FritterContext = Fritter.FritterContext> = BaseFritterContext &
{
	renderComponent: RenderComponentFunction<RenderComponentOptions>
};

export type CreateOptions<ComponentFunctionOptions, BaseFritterContext extends Fritter.FritterContext = Fritter.FritterContext> =
{
	componentFunction: ComponentFunction<ComponentFunctionOptions>;
	getOptionsFunction: GetOptionsFunction<ComponentFunctionOptions, BaseFritterContext>;
};

export type CreateResult<ComponentFunctionOptions, BaseFritterContext extends Fritter.FritterContext = Fritter.FritterContext> =
{
	componentFunction: ComponentFunction<ComponentFunctionOptions>;
	getOptionsFunction: GetOptionsFunction<ComponentFunctionOptions, BaseFritterContext>;

	execute: Fritter.MiddlewareFunction<MiddlewareFritterContext<ComponentFunctionOptions, BaseFritterContext>>;
};

export function create<ComponentFunctionOptions, BaseFritterContext extends Fritter.FritterContext = Fritter.FritterContext>(
	options: CreateOptions<ComponentFunctionOptions, BaseFritterContext>
): CreateResult<ComponentFunctionOptions, BaseFritterContext>
{
	const middleware: CreateResult<ComponentFunctionOptions, BaseFritterContext> =
	{
		componentFunction: options.componentFunction,
		getOptionsFunction: options.getOptionsFunction,
		execute: async (context, next) =>
		{
			context.renderComponent = (options) =>
			{
				const fullOptions = middleware.getOptionsFunction(context, options);

				const component = middleware.componentFunction(fullOptions);

				context.fritterResponse.setContentType("text/html");
				context.fritterResponse.setBody(component.renderToString());
			};

			await next();
		},
	};

	return middleware;
}