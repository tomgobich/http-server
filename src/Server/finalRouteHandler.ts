/**
 * @module @poppinss/http-server
 */

/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ResolvedControllerNode, HttpContextContract } from '../contracts'
import { useReturnValue } from './useReturnValue'
import { iocMethods } from '../helpers'

/**
 * Final handler executes the route handler based on it's resolved
 * type and the response body on various conditions (check method body)
 * for same.
 */
export async function finalRouteHandler<Context extends HttpContextContract> (ctx: Context) {
  const handler = ctx.route!.meta.resolvedHandler as ResolvedControllerNode<Context>

  /**
   * When route handler is a plain function, then execute it
   * as it is.
   */
  if (handler.type === 'function') {
    const returnValue = await handler.handler(ctx)
    if (useReturnValue(returnValue, ctx)) {
      ctx.response.send(returnValue)
    }
    return
  }

  /**
   * Otherwise lookup the controller inside the IoC container
   * and make the response
   */
  const controllerInstance = global[iocMethods.make](handler.namespace)
  const returnValue = await global[iocMethods.call](controllerInstance, handler.method, [ctx])

  if (useReturnValue(returnValue, ctx)) {
    ctx.response.send(returnValue)
  }
}
