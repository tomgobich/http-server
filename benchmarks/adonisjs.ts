/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'node:http'
import { Emitter } from '@adonisjs/events'
import { EncryptionManager } from '@adonisjs/encryption'
import { Legacy } from '@adonisjs/encryption/drivers/legacy'
import { Application } from '@adonisjs/application'

import { defineConfig } from '../index.js'
import { Server } from '../src/server/main.js'
import { Logger } from '@adonisjs/logger'

const app = new Application(new URL('./', import.meta.url), {
  environment: 'web',
  importer: () => {},
})
await app.init()

const encryption = new EncryptionManager({
  default: 'legacy',
  list: {
    legacy: () => new Legacy({ key: 'averylongrandom32charslongsecret' }),
  },
})

const server = new Server(
  app,
  encryption,
  new Emitter(app),
  new Logger({ enabled: false }),
  defineConfig({})
)
server.getRouter().get('/', async (ctx) => {
  return ctx.response.send({ hello: 'world' })
})

await server.boot()

createServer(server.handle.bind(server)).listen(4000, () => {
  console.log('listening on 4000')
})
